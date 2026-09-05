import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, text, summaryStyle = 'Poin penting', flashcardCount = 12, quizCount = 5, difficulty = 'Sedang' } = body;

    // Check custom API key from request body or header
    const customApiKey = body.apiKey || req.headers.get('x-gemini-api-key');
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Teks materi tidak boleh kosong.' },
        { status: 400 }
      );
    }

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
Analisis materi belajar berikut secara mendalam dan buatkan 4 output pembelajaran terstruktur dalam bahasa Indonesia yang akademis, akurat, dan sangat relevan dengan teks asli:
1. Ringkasan (gaya: ${summaryStyle})
2. Tepat ${flashcardCount} Kartu Flashcard tanya-jawab. PENTING: Setiap flashcard (front dan back) WAJIB bersumber LANGSUNG dan spesifik dari fakta, definisi, istilah, rumus, atau konsep penting di dalam teks materi di bawah. Dilarang keras menggunakan pertanyaan atau jawaban generik/boilerplate (misal: "Apa poin ke-1?"). Front harus berupa pertanyaan spesifik mengenai istilah/konsep materi, dan back harus berupa jawaban atau penjelasan akurat berdasarkan teks materi.
3. Tepat ${quizCount} Soal Kuis Pilihan Ganda (Tingkat: ${difficulty}) dengan 4 opsi, indeks jawaban benar (0-3), pembahasan berbobot yang mengutip kalimat materi, dan topik spesifik.
4. Mind Map (peta konsep terstruktur hierarkis dengan node root, cabang level 1, dan cabang subtopik level 2 yang bersumber dari isi teks).

Judul materi: "${title || 'Materi Belajar'}"
Mata pelajaran: "${subject || 'Umum'}"

Isi Teks Materi:
"""
${text.slice(0, 15000)}
"""

PENTING:
- Pastikan seluruh flashcard, kuis, ringkasan, dan mind map berbasis 100% langsung pada isi teks materi di atas (tergrounding secara akurat).
- correct_index kuis harus integer antara 0 sampai 3.
- mindmap harus memiliki 1 root (parent_id: null, level: 0), beberapa cabang utama (parent_id: "root", level: 1), dan anak-anak cabang (parent_id mengacu ke id cabang level 1, level: 2).`;

        const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
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

            // 18-second timeout per candidate
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 18000)
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
              console.log(`[Gemini API] Model ${model} unavailable or busy/quota. Trying next model...`);
              continue;
            }
            console.log(`[Gemini API] Model ${model} error:`, modelError?.message || modelError);
          }
        }

        if (rawJson && rawJson.summary && rawJson.flashcards && rawJson.quiz && rawJson.mindmap) {
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
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 20);
  const rawSentences = text.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 20);
  const sentences = rawSentences.length > 0 ? rawSentences : [text];

  const overview = paragraphs.length > 0 
    ? `Materi "${title}" (${subject}) membahas secara mendalam topik utama: ${paragraphs[0].slice(0, 220)}...`
    : `Materi "${title}" berisi rangkuman pembahasan materi ${subject}.`;

  const key_points = paragraphs.slice(0, 5).map(p => p.slice(0, 180));
  if (key_points.length === 0) key_points.push(`Materi ${title} menguraikan konsep dan prinsip dasar ${subject}.`);

  const key_terms = sentences.slice(0, 4).map((s, idx) => {
    const parts = s.split(':');
    if (parts.length >= 2) {
      return { term: parts[0].trim().slice(0, 40), definition: parts[1].trim().slice(0, 140) };
    }
    const words = s.split(' ');
    return { term: words.slice(0, 3).join(' ') || `Konsep ${idx + 1}`, definition: s.slice(0, 140) };
  });

  const remember = [
    `Fokuskan pemahaman pada inti materi: ${title}.`,
    `Gunakan flashcard ini untuk melatih memori jangka panjang secara aktif.`
  ];

  const flashcards = [];
  const tags = ['KONSEP UTAMA', 'DEFINISI', 'PRINSIP', 'ANALISIS', 'APLIKASI'];
  for (let i = 0; i < Math.min(fcCount, 15); i++) {
    const sent = sentences[i % sentences.length];
    const words = sent.split(' ');
    const term = words.slice(0, 4).join(' ');
    flashcards.push({
      id: `fc-gen-${Date.now()}-${i}`,
      front: `Jelaskan poin penting mengenai: "${term}..."`,
      back: `Berdasarkan teks materi "${title}" (${subject}): ${sent}`,
      tag: tags[i % tags.length],
      status: 'unseen'
    });
  }

  const quiz = [];
  for (let i = 0; i < Math.min(qCount, 10); i++) {
    const correctSent = sentences[i % sentences.length];
    const wrong1 = sentences[(i + 1) % sentences.length];
    const wrong2 = sentences[(i + 2) % sentences.length];
    const wrong3 = sentences[(i + 3) % sentences.length];

    const options = [
      correctSent.slice(0, 160),
      wrong1.slice(0, 160),
      wrong2.slice(0, 160),
      wrong3.slice(0, 160)
    ];

    quiz.push({
      id: `q-gen-${Date.now()}-${i}`,
      question: `Berdasarkan materi "${title}", manakah pernyataan yang paling akurat sesuai teks?`,
      options: options as [string, string, string, string],
      correct_index: 0,
      explanation: `Pernyataan ini valid dan bersumber langsung dari materi ${title} (${subject}).`,
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
