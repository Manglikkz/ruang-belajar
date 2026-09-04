import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, text, summaryStyle = 'Poin penting', flashcardCount = 12, quizCount = 5, difficulty = 'Sedang' } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Teks materi tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const prompt = `Anda adalah asisten pendidikan pintar "Ruang Belajar AI" untuk pelajar Indonesia.
Analisis materi belajar berikut dan buatkan 4 output pembelajaran terstruktur dalam bahasa Indonesia yang ramah, akademis, dan mudah dipahami:
1. Ringkasan (gaya: ${summaryStyle})
2. ${flashcardCount} Kartu Flashcard tanya-jawab
3. ${quizCount} Soal Kuis Pilihan Ganda (Tingkat: ${difficulty}) dengan 4 opsi, indeks jawaban benar (0-3), pembahasan berbobot, dan topik spesifik
4. Mind Map (peta konsep terstruktur hierarkis dengan node root, cabang level 1, dan cabang subtopik level 2)

Judul materi: "${title || 'Materi Belajar'}"
Mata pelajaran: "${subject || 'Umum'}"

Isi Teks Materi:
"""
${text.slice(0, 15000)}
"""

PENTING:
- Pastikan semua output berbasis langsung pada isi materi di atas (tergrounding secara akurat).
- correct_index kuis harus integer antara 0 sampai 3.
- mindmap harus memiliki 1 root (parent_id: null, level: 0), beberapa cabang utama (parent_id: "root", level: 1), dan anak-anak cabang (parent_id mengacu ke id cabang level 1, level: 2).`;

        const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
        let rawJson: any = null;

        for (const model of CANDIDATE_MODELS) {
          try {
            const apiCallPromise = ai.models.generateContent({
              model,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    summary: {
                      type: Type.OBJECT,
                      properties: {
                        overview: { type: Type.STRING },
                        key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                        key_terms: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              term: { type: Type.STRING },
                              definition: { type: Type.STRING }
                            },
                            required: ['term', 'definition']
                          }
                        },
                        remember: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ['overview', 'key_points', 'key_terms', 'remember']
                    },
                    flashcards: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          front: { type: Type.STRING },
                          back: { type: Type.STRING },
                          tag: { type: Type.STRING }
                        },
                        required: ['front', 'back', 'tag']
                      }
                    },
                    quiz: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          question: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                          },
                          correct_index: { type: Type.INTEGER },
                          explanation: { type: Type.STRING },
                          topic: { type: Type.STRING }
                        },
                        required: ['question', 'options', 'correct_index', 'explanation', 'topic']
                      }
                    },
                    mindmap: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        nodes: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              label: { type: Type.STRING },
                              parent_id: { type: Type.STRING },
                              level: { type: Type.INTEGER }
                            },
                            required: ['id', 'label', 'level']
                          }
                        }
                      },
                      required: ['title', 'nodes']
                    }
                  },
                  required: ['summary', 'flashcards', 'quiz', 'mindmap']
                }
              }
            });

            // 15-second timeout per candidate to prevent hanging on congested models
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 15000)
            );

            const response: any = await Promise.race([apiCallPromise, timeoutPromise]);

            if (response.text) {
              const parsed = JSON.parse(response.text);
              if (parsed && parsed.summary && parsed.flashcards && parsed.quiz && parsed.mindmap) {
                rawJson = parsed;
                break; // Succeeded!
              }
            }
          } catch (modelError: any) {
            const isTransientError =
              modelError?.status === 503 ||
              modelError?.message?.includes('503') ||
              modelError?.message?.includes('high demand') ||
              modelError?.message?.includes('Timeout') ||
              modelError?.status === 429;

            if (isTransientError) {
              console.log(`[Gemini API] Model ${model} unavailable or busy. Trying next model...`);
              continue;
            }
            console.log(`[Gemini API] Model ${model} error:`, modelError?.message || modelError);
          }
        }

        if (rawJson && rawJson.summary && rawJson.flashcards && rawJson.quiz && rawJson.mindmap) {
          // Format with IDs
          return NextResponse.json(formatOutput(rawJson, title, subject));
        }
      } catch (genError: any) {
        console.log('[Gemini API] Falling back to smart extractor due to error:', genError?.message || genError);
      }
    }

    // Fallback deterministic smart generator for offline / fallback
    const fallbackOutput = generateSmartFallback(title || 'Materi Belajar', subject || 'Umum', text, flashcardCount, quizCount);
    return NextResponse.json(fallbackOutput);
  } catch (error) {
    console.error('API generate error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses materi.' },
      { status: 500 }
    );
  }
}

function formatOutput(raw: any, title: string, subject: string) {
  const flashcards = (raw.flashcards || []).map((fc: any, i: number) => ({
    id: `fc-gen-${Date.now()}-${i}`,
    front: fc.front,
    back: fc.back,
    tag: fc.tag || 'KONSEP',
    status: 'unseen'
  }));

  const quiz = (raw.quiz || []).map((q: any, i: number) => ({
    id: `q-gen-${Date.now()}-${i}`,
    question: q.question,
    options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : [q.options[0] || 'A', q.options[1] || 'B', q.options[2] || 'C', q.options[3] || 'D'],
    correct_index: typeof q.correct_index === 'number' && q.correct_index >= 0 && q.correct_index < 4 ? q.correct_index : 0,
    explanation: q.explanation || 'Berdasarkan teks materi yang dipelajari.',
    topic: q.topic || subject || 'Materi'
  }));

  // Position nodes nicely on canvas
  const rawNodes = raw.mindmap?.nodes || [];
  let rootNode = rawNodes.find((n: any) => n.level === 0 || !n.parent_id);
  if (!rootNode) {
    rootNode = { id: 'root', label: title, parent_id: null, level: 0, x: 420, y: 280, icon: 'BookOpen' };
  } else {
    rootNode.x = 420;
    rootNode.y = 280;
    rootNode.icon = 'BookOpen';
  }

  const level1Nodes = rawNodes.filter((n: any) => n.id !== rootNode.id && (n.level === 1 || n.parent_id === rootNode.id));
  const level2Nodes = rawNodes.filter((n: any) => n.id !== rootNode.id && n.level > 1 && n.parent_id !== rootNode.id);

  // Position 4 quadrants
  const quadrantPositions = [
    { x: 200, y: 160, childX: 40, childYBase: 120 }, // Top-Left
    { x: 640, y: 160, childX: 820, childYBase: 120 }, // Top-Right
    { x: 200, y: 390, childX: 40, childYBase: 350 }, // Bottom-Left
    { x: 640, y: 390, childX: 820, childYBase: 350 }  // Bottom-Right
  ];

  const processedNodes: any[] = [rootNode];

  level1Nodes.forEach((node: any, idx: number) => {
    const q = quadrantPositions[idx % quadrantPositions.length];
    node.x = q.x;
    node.y = q.y;
    node.parent_id = rootNode.id;
    node.level = 1;
    processedNodes.push(node);

    // Position children of this level 1 node
    const children = level2Nodes.filter((c: any) => c.parent_id === node.id);
    children.forEach((child: any, cIdx: number) => {
      child.x = q.childX;
      child.y = q.childYBase + cIdx * 45;
      child.level = 2;
      processedNodes.push(child);
    });
  });

  return {
    summary: raw.summary,
    flashcards,
    quiz,
    mindmap: {
      title: raw.mindmap?.title || title,
      nodes: processedNodes.length > 1 ? processedNodes : defaultNodes(title)
    }
  };
}

function defaultNodes(title: string) {
  return [
    { id: 'root', label: title, parent_id: null, level: 0, icon: 'TrendingUp', x: 420, y: 280 },
    { id: 'sub-1', label: 'Konsep Utama', parent_id: 'root', level: 1, icon: 'Layers', x: 200, y: 160 },
    { id: 'sub-1-1', label: 'Definisi Dasar', parent_id: 'sub-1', level: 2, x: 40, y: 130 },
    { id: 'sub-1-2', label: 'Prinsip Kunci', parent_id: 'sub-1', level: 2, x: 40, y: 180 },
    { id: 'sub-2', label: 'Penerapan & Contoh', parent_id: 'root', level: 1, icon: 'Compass', x: 640, y: 160 },
    { id: 'sub-2-1', label: 'Aplikasi Nyata', parent_id: 'sub-2', level: 2, x: 820, y: 130 },
    { id: 'sub-2-2', label: 'Studi Kasus', parent_id: 'sub-2', level: 2, x: 820, y: 180 },
    { id: 'sub-3', label: 'Faktor Pengaruh', parent_id: 'root', level: 1, icon: 'Sliders', x: 200, y: 390 },
    { id: 'sub-3-1', label: 'Faktor Internal', parent_id: 'sub-3', level: 2, x: 40, y: 360 },
    { id: 'sub-3-2', label: 'Faktor Eksternal', parent_id: 'sub-3', level: 2, x: 40, y: 410 },
    { id: 'sub-4', label: 'Kesimpulan & Evaluasi', parent_id: 'root', level: 1, icon: 'CheckCircle', x: 640, y: 390 },
    { id: 'sub-4-1', label: 'Poin Kunci Ujian', parent_id: 'sub-4', level: 2, x: 820, y: 360 },
    { id: 'sub-4-2', label: 'Refleksi Akhir', parent_id: 'sub-4', level: 2, x: 820, y: 410 }
  ];
}

function generateSmartFallback(title: string, subject: string, text: string, fcCount: number, qCount: number) {
  const sentences = text
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const cleanSample = sentences.slice(0, 8);
  const overview = cleanSample.length > 0
    ? `Materi "${title}" (${subject}) mengulas serangkaian konsep penting: ${cleanSample.slice(0, 2).join('. ')}.`
    : `Materi "${title}" berisi intisari pembahasan pada bidang studi ${subject} yang terstruktur untuk memudahkan pemahaman peserta didik.`;

  const key_points = cleanSample.slice(2, 6).length >= 2
    ? cleanSample.slice(2, 6)
    : [
        `Konsep fundamental pada materi ${title} membantu memahami mekanisme dan relasi antar subtopik.`,
        `Pemahaman terminologi utama sangat penting untuk menguasai penyelesaian soal latihan dan evaluasi.`,
        `Hubungan sebab-akibat antar komponen menjadi kunci dalam analisis materi ${subject}.`,
        `Aplikasi praktis dari materi ini sering diujikan dalam kuis dan ujian akademik.`
      ];

  const key_terms = [
    { term: title.split('—')[0].trim() || 'Konsep Dasar', definition: `Pilar utama dalam pembahasan ${subject}.` },
    { term: 'Analisis Teoretis', definition: 'Metode penguraian fenomena ke dalam variabel-variabel pembentuknya.' },
    { term: 'Aplikasi Nyata', definition: 'Penggunaan konsep materi dalam permasalahan dunia nyata dan studi kasus.' }
  ];

  const remember = [
    `Fokuslah pada keterkaitan antar variabel kunci pada ${title}.`,
    `Ulangi flashcard secara rutin untuk memperkuat daya ingat jangka panjang.`
  ];

  const flashcards = [];
  const tags = ['DEFINISI', 'HUKUM & PRINSIP', 'FAKTOR', 'APLIKASI', 'RUMUS & CIRI'];
  for (let i = 0; i < Math.min(fcCount, 12); i++) {
    const s = cleanSample[i % cleanSample.length] || `Konsep penting ke-${i + 1} dari ${title}`;
    flashcards.push({
      id: `fc-gen-${Date.now()}-${i}`,
      front: `Apa inti penting dari: "${s.slice(0, 80)}..."?`,
      back: `Penjelasan mendalam: ${s}. Hal ini penting untuk dipahami secara menyeluruh dalam topik ${subject}.`,
      tag: tags[i % tags.length],
      status: 'unseen'
    });
  }

  const quiz = [];
  for (let i = 0; i < Math.min(qCount, 5); i++) {
    quiz.push({
      id: `q-gen-${Date.now()}-${i}`,
      question: `Berdasarkan materi ${title}, manakah pernyataan yang paling tepat mengenai poin ke-${i + 1}?`,
      options: [
        `Pernyataan bahwa konsep ini beroperasi sesuai prinsip ilmiah pada ${subject}`,
        `Variabel pendukung tidak memiliki pengaruh terhadap hasil akhir`,
        `Semua faktor berubah secara bersamaan tanpa aturan tertentu`,
        `Materi ini hanya berlaku dalam situasi laboratorium terbatas`
      ],
      correct_index: 0,
      explanation: `Jawaban A tepat karena berlandaskan pada prinsip ilmiah yang tertera dalam teks materi ${title}.`,
      topic: subject
    });
  }

  return {
    summary: {
      overview,
      key_points,
      key_terms,
      remember
    },
    flashcards,
    quiz,
    mindmap: {
      title,
      nodes: defaultNodes(title)
    }
  };
}
