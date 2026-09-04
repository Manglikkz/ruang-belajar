import { Material, LearningHistoryEvent } from './types';

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'ekonomi-permintaan-penawaran',
    title: 'Ekonomi — Permintaan & Penawaran',
    subject: 'Ekonomi',
    source_type: 'pdf',
    source_filename: 'Ekonomi_Permintaan_Penawaran.pdf',
    source_size: '2.4 MB',
    status: 'ready',
    created_at: '2 hari yang lalu',
    last_opened_at: 'Hari ini, 14:20',
    progress_percent: 70,
    best_quiz_score: { score: 8, total: 10 },
    mastered_flashcards_count: 12,
    summary: {
      overview:
        'Materi ini membahas prinsip dasar mekanisme pasar dalam ekonomi mikro, mencakup konsep permintaan (demand), penawaran (supply), hukum yang mengatur perilaku konsumen dan produsen, serta bagaimana interaksi keduanya membentuk harga dan kuantitas keseimbangan pasar.',
      key_points: [
        'Hukum Permintaan: Semakin tinggi harga suatu barang, semakin sedikit jumlah barang yang diminta, dengan asumsi ceteris paribus.',
        'Hukum Penawaran: Semakin tinggi harga suatu barang, semakin banyak jumlah barang yang ditawarkan oleh produsen.',
        'Faktor non-harga seperti pendapatan masyarakat, selera, harga barang komplementer/substitusi, teknologi, dan biaya produksi dapat menggeser kurva permintaan maupun penawaran.',
        'Titik Keseimbangan (Equilibrium) tercapai ketika jumlah barang yang diminta tepat sama dengan jumlah barang yang ditawarkan (Qd = Qs).'
      ],
      key_terms: [
        {
          term: 'Ceteris Paribus',
          definition: 'Asumsi bahwa faktor-faktor lain di luar harga dianggap tetap atau tidak berubah.'
        },
        {
          term: 'Kurva Permintaan',
          definition: 'Grafik berslope negatif yang menghubungkan harga barang dengan kuantitas yang diminta pembeli.'
        },
        {
          term: 'Kurva Penawaran',
          definition: 'Grafik berslope positif yang menghubungkan tingkat harga dengan kuantitas barang yang ditawarkan penjual.'
        },
        {
          term: 'Keseimbangan Pasar (Equilibrium)',
          definition: 'Kondisi di mana harga terbentuk dari perpotongan kurva penawaran dan kurva permintaan tanpa adanya kelebihan pasokan (surplus) atau kekurangan (shortage).'
        }
      ],
      remember: [
        'Perbedaan pergerakan di sepanjang kurva (movement along the curve akibat harga barang itu sendiri) vs pergeseran kurva (shift of the curve akibat faktor non-harga).',
        'Elastisitas mengukur sensitivitas perubahan kuantitas akibat perubahan variabel harga atau pendapatan.'
      ]
    },
    flashcards: [
      {
        id: 'fc-1',
        front: 'Apa bunyi Hukum Permintaan?',
        back: 'Jika harga suatu barang naik, jumlah barang yang diminta akan turun. Sebaliknya jika harga turun, jumlah barang yang diminta akan naik (ceteris paribus).',
        tag: 'HUKUM EKONOMI',
        status: 'mastered'
      },
      {
        id: 'fc-2',
        front: 'Sebutkan 3 faktor non-harga yang mempengaruhi permintaan konsumen!',
        back: '1. Tingkat pendapatan konsumen, 2. Selera atau tren masyarakat, 3. Harga barang pengganti (substitusi) atau pelengkap (komplementer).',
        tag: 'FAKTOR',
        status: 'mastered'
      },
      {
        id: 'fc-3',
        front: 'Apa yang dimaksud dengan barang substitusi dan berikan contohnya?',
        back: 'Barang pengganti yang memiliki fungsi serupa. Contoh: kopi dan teh, atau mentega dan margarin.',
        tag: 'KONSEP',
        status: 'mastered'
      },
      {
        id: 'fc-4',
        front: 'Apa yang dimaksud dengan permintaan?',
        back: 'Jumlah barang atau jasa yang ingin dan mampu dibeli oleh konsumen pada berbagai tingkat harga dalam periode waktu tertentu (ceteris paribus).',
        tag: 'DEFINISI',
        status: 'mastered'
      },
      {
        id: 'fc-5',
        front: 'Bagaimana kemajuan teknologi mempengaruhi penawaran produsen?',
        back: 'Kemajuan teknologi menurunkan biaya produksi dan meningkatkan efisiensi, sehingga menggeser kurva penawaran ke arah kanan (penawaran bertambah).',
        tag: 'PENAWARAN',
        status: 'mastered'
      },
      {
        id: 'fc-6',
        front: 'Apa arti titik keseimbangan pasar (Equilibrium)?',
        back: 'Titik perpotongan antara kurva permintaan dan penawaran di mana jumlah yang diminta sama persis dengan jumlah yang ditawarkan (Qd = Qs).',
        tag: 'PASAR',
        status: 'mastered'
      },
      {
        id: 'fc-7',
        front: 'Apa dampak penetapan harga tertinggi (Ceiling Price) oleh pemerintah?',
        back: 'Menyebabkan kuantitas permintaan lebih besar daripada penawaran sehingga memicu terjadinya kelangkaan barang (shortage).',
        tag: 'KEBIJAKAN',
        status: 'repeat'
      },
      {
        id: 'fc-8',
        front: 'Apa perbedaan antara movement along curve dan shift of curve?',
        back: 'Movement terjadi akibat perubahan harga barang itu sendiri; Shift terjadi akibat perubahan faktor selain harga barang (seperti biaya, pendapatan, selera).',
        tag: 'ANALISIS KURVA',
        status: 'difficult'
      },
      {
        id: 'fc-9',
        front: 'Mengapa kurva penawaran memiliki kemiringan (slope) positif?',
        back: 'Karena produsen termotivasi untuk memproduksi dan menjual lebih banyak barang ketika harga jualnya lebih tinggi demi meraih laba maksimal.',
        tag: 'PENAWARAN',
        status: 'mastered'
      },
      {
        id: 'fc-10',
        front: 'Apa yang terjadi jika harga pasar berada di atas harga keseimbangan?',
        back: 'Terjadi surplus atau kelebihan penawaran (Qs > Qd), yang mendorong produsen menurunkan harga agar barang laku terjual.',
        tag: 'MEKANISME PASAR',
        status: 'mastered'
      },
      {
        id: 'fc-11',
        front: 'Apa hubungan antara barang komplementer terhadap kenaikan harga pasangannya?',
        back: 'Kenaikan harga barang A akan menurunkan permintaan terhadap barang komplementer B. Contoh: Kenaikan harga bensin menurunkan permintaan mobil.',
        tag: 'KONSEP',
        status: 'mastered'
      },
      {
        id: 'fc-12',
        front: 'Apa rumus elastisitas harga permintaan (Ed)?',
        back: 'Ed = (Persentase perubahan jumlah barang yang diminta) ÷ (Persentase perubahan harga barang).',
        tag: 'RUMUS',
        status: 'mastered'
      }
    ],
    quiz: [
      {
        id: 'q-1',
        question: 'Menurut hukum permintaan, apa yang terjadi ketika harga suatu barang mengalami kenaikan signifikan?',
        options: [
          'Jumlah penawaran produsen akan menurun drastis',
          'Jumlah barang yang diminta konsumen akan menurun',
          'Kurva permintaan akan bergeser ke kanan atas',
          'Pendapatan riil konsumen akan otomatis bertambah'
        ],
        correct_index: 1,
        explanation: 'Hukum permintaan menyatakan adanya hubungan terbalik antara harga dan jumlah barang yang diminta konsumen (ceteris paribus).',
        topic: 'Permintaan'
      },
      {
        id: 'q-2',
        question: 'Kondisi pasar di mana jumlah barang yang diminta sama persis dengan jumlah barang yang ditawarkan disebut...',
        options: [
          'Surplus Konsumen',
          'Defisit Anggaran',
          'Keseimbangan Pasar (Equilibrium)',
          'Monopoli Alami'
        ],
        correct_index: 2,
        explanation: 'Titik equilibrium adalah kesepakatan harga dan kuantitas di mana Qd = Qs.',
        topic: 'Keseimbangan Pasar'
      },
      {
        id: 'q-3',
        question: 'Faktor manakah di bawah ini yang dapat menyebabkan kurva penawaran bergeser ke arah kanan?',
        options: [
          'Kenaikan biaya bahan baku produksi',
          'Adanya penemuan teknologi baru yang lebih efisien',
          'Penetapan pajak penjualan yang lebih tinggi',
          'Penurunan jumlah produsen di industri tersebut'
        ],
        correct_index: 1,
        explanation: 'Perbaikan teknologi meningkatkan produktivitas dan memotong biaya produksi, sehingga memperbanyak penawaran pada setiap tingkat harga.',
        topic: 'Penawaran'
      },
      {
        id: 'q-4',
        question: 'Jika harga tiket bioskop naik dan menyebabkan permintaan popcorn menurun, maka popcorn dan tiket bioskop merupakan barang...',
        options: [
          'Substitusi',
          'Inferior',
          'Komplementer',
          'Giffen'
        ],
        correct_index: 2,
        explanation: 'Barang komplementer saling melengkapi; kenaikan harga satu barang menekan konsumsi pasangannya.',
        topic: 'Jenis Barang'
      },
      {
        id: 'q-5',
        question: 'Apa arti kata "ceteris paribus" dalam analisis kurva permintaan?',
        options: [
          'Harga barang selalu berfluktuasi bebas',
          'Faktor-faktor lain di luar harga dianggap tetap',
          'Semua konsumen memiliki selera yang identik',
          'Pemerintah memegang kendali atas harga eceran'
        ],
        correct_index: 1,
        explanation: 'Ceteris paribus merupakan asumsi ilmiah bahwa variabel-variabel lain tidak berubah saat meneliti efek satu variabel harga.',
        topic: 'Definisi'
      }
    ],
    quiz_attempts: [
      {
        id: 'att-1',
        date: 'Kemarin, 16:30',
        score: 8,
        total: 10,
        difficulty: 'Sedang',
        answers: []
      }
    ],
    mindmap: {
      title: 'Permintaan & Penawaran',
      nodes: [
        {
          id: 'root',
          label: 'Permintaan & Penawaran',
          parent_id: null,
          level: 0,
          icon: 'TrendingUp',
          x: 420,
          y: 280
        },
        // Branch 1: Permintaan (Top Left)
        {
          id: 'permintaan',
          label: 'Permintaan',
          parent_id: 'root',
          level: 1,
          icon: 'User',
          x: 200,
          y: 160
        },
        {
          id: 'perm-harga',
          label: 'Harga',
          parent_id: 'permintaan',
          level: 2,
          x: 40,
          y: 120
        },
        {
          id: 'perm-pendapatan',
          label: 'Pendapatan',
          parent_id: 'permintaan',
          level: 2,
          x: 40,
          y: 165
        },
        {
          id: 'perm-selera',
          label: 'Selera',
          parent_id: 'permintaan',
          level: 2,
          x: 40,
          y: 210
        },

        // Branch 2: Penawaran (Top Right)
        {
          id: 'penawaran',
          label: 'Penawaran',
          parent_id: 'root',
          level: 1,
          icon: 'Tag',
          x: 640,
          y: 160
        },
        {
          id: 'pen-biaya',
          label: 'Biaya Produksi',
          parent_id: 'penawaran',
          level: 2,
          x: 820,
          y: 120
        },
        {
          id: 'pen-teknologi',
          label: 'Teknologi',
          parent_id: 'penawaran',
          level: 2,
          x: 820,
          y: 165
        },
        {
          id: 'pen-jumlah',
          label: 'Jumlah Penjual',
          parent_id: 'penawaran',
          level: 2,
          x: 820,
          y: 210
        },

        // Branch 3: Faktor Harga (Bottom Left)
        {
          id: 'faktor-harga',
          label: 'Faktor Harga',
          parent_id: 'root',
          level: 1,
          icon: 'DollarSign',
          x: 200,
          y: 390
        },
        {
          id: 'fh-harga',
          label: 'Harga',
          parent_id: 'faktor-harga',
          level: 2,
          x: 40,
          y: 350
        },
        {
          id: 'fh-pendapatan',
          label: 'Pendapatan',
          parent_id: 'faktor-harga',
          level: 2,
          x: 40,
          y: 395
        },
        {
          id: 'fh-selera',
          label: 'Selera',
          parent_id: 'faktor-harga',
          level: 2,
          x: 40,
          y: 440
        },

        // Branch 4: Keseimbangan Pasar (Bottom Right)
        {
          id: 'keseimbangan',
          label: 'Keseimbangan Pasar',
          parent_id: 'root',
          level: 1,
          icon: 'Scale',
          x: 640,
          y: 390
        },
        {
          id: 'kp-harga',
          label: 'Harga Keseimbangan',
          parent_id: 'keseimbangan',
          level: 2,
          x: 820,
          y: 365
        },
        {
          id: 'kp-kuantitas',
          label: 'Kuantitas Keseimbangan',
          parent_id: 'keseimbangan',
          level: 2,
          x: 820,
          y: 420
        }
      ]
    }
  },
  {
    id: 'biologi-sistem-pernapasan',
    title: 'Biologi — Sistem Pernapasan Manusia',
    subject: 'Biologi',
    source_type: 'docx',
    source_filename: 'Biologi_Sistem_Pernapasan.docx',
    source_size: '1.8 MB',
    status: 'ready',
    created_at: '5 hari yang lalu',
    last_opened_at: '3 hari yang lalu',
    progress_percent: 45,
    best_quiz_score: { score: 9, total: 10 },
    mastered_flashcards_count: 8,
    summary: {
      overview:
        'Sistem pernapasan manusia berfungsi untuk mengambil oksigen (O2) dari atmosfer dan melepaskan karbon dioksida (CO2) sebagai produk sisa metabolisme seluler melalui jalur hidung, laring, trakea, bronkus, dan alveolus.',
      key_points: [
        'Urutan saluran pernapasan: Hidung -> Faring -> Laring -> Trakea -> Bronkus -> Bronkiolus -> Alveolus.',
        'Pertukaran gas terjadi secara difusi sederhana di dinding alveolus yang kaya akan pembuluh kapiler darah.',
        'Mekanisme pernapasan dada melibatkan otot antartulang rusuk (interkostal), sedangkan pernapasan perut melibatkan kontraksi dan relaksasi diafragma.'
      ],
      key_terms: [
        {
          term: 'Alveolus',
          definition: 'Kantong udara mikroskopis di paru-paru tempat terjadinya pertukaran gas O2 dan CO2.'
        },
        {
          term: 'Diafragma',
          definition: 'Otot utama pernapasan yang memisahkan rongga dada dan rongga perut.'
        },
        {
          term: 'Hemoglobin',
          definition: 'Protein pengikat oksigen dalam eritrosit (sel darah merah).'
        }
      ],
      remember: [
        'Saat inspirasi, diafragma berkontraksi mendatar sehingga volume rongga dada membesar dan tekanan udara paru-paru mengecil.',
        'Kapasitas vital paru-paru adalah jumlah udara maksimum yang dapat dikeluarkan setelah inspirasi maksimal.'
      ]
    },
    flashcards: [
      {
        id: 'fc-b1',
        front: 'Di manakah tempat terjadinya pertukaran gas O2 dan CO2 pada paru-paru?',
        back: 'Di alveolus melalui proses difusi melewati membran kapiler.',
        tag: 'ANATOMI',
        status: 'mastered'
      },
      {
        id: 'fc-b2',
        front: 'Bagaimana kondisi diafragma saat fase inspirasi pernapasan perut?',
        back: 'Diafragma berkontraksi dan mendatar, memperluas volume rongga dada.',
        tag: 'MEKANISME',
        status: 'mastered'
      }
    ],
    quiz: [
      {
        id: 'qb-1',
        question: 'Bagian sistem pernapasan yang berfungsi menghangatkan dan menyaring udara pertama kali adalah...',
        options: [
          'Rongga hidung dengan silia dan mukus',
          'Trakea',
          'Laring',
          'Alveolus'
        ],
        correct_index: 0,
        explanation: 'Rongga hidung dilengkapi rambut silia dan selaput lendir untuk menyaring debu serta menyesuaikan suhu udara.',
        topic: 'Saluran Pernapasan'
      }
    ],
    quiz_attempts: [],
    mindmap: {
      title: 'Sistem Pernapasan Manusia',
      nodes: [
        {
          id: 'root-bio',
          label: 'Sistem Pernapasan',
          parent_id: null,
          level: 0,
          icon: 'Activity',
          x: 420,
          y: 280
        },
        {
          id: 'bio-organ',
          label: 'Organ Pernapasan',
          parent_id: 'root-bio',
          level: 1,
          icon: 'Layers',
          x: 200,
          y: 180
        },
        {
          id: 'bio-hidung',
          label: 'Rongga Hidung',
          parent_id: 'bio-organ',
          level: 2,
          x: 40,
          y: 150
        },
        {
          id: 'bio-trakea',
          label: 'Trakea & Bronkus',
          parent_id: 'bio-organ',
          level: 2,
          x: 40,
          y: 210
        },
        {
          id: 'bio-fisiologi',
          label: 'Fisiologi Pertukaran Gas',
          parent_id: 'root-bio',
          level: 1,
          icon: 'Wind',
          x: 640,
          y: 180
        },
        {
          id: 'bio-alveolus',
          label: 'Difusi Alveolus',
          parent_id: 'bio-fisiologi',
          level: 2,
          x: 820,
          y: 150
        },
        {
          id: 'bio-diafragma',
          label: 'Gerak Diafragma',
          parent_id: 'bio-fisiologi',
          level: 2,
          x: 820,
          y: 210
        }
      ]
    }
  }
];

export const INITIAL_HISTORY: LearningHistoryEvent[] = [
  {
    id: 'hist-1',
    material_id: 'ekonomi-permintaan-penawaran',
    material_title: 'Ekonomi — Permintaan & Penawaran',
    event_type: 'quiz_completed',
    description: 'Menyelesaikan Kuis Interaktif (Skor: 8/10)',
    timestamp: 'Kemarin, 16:30',
    score: '80%'
  },
  {
    id: 'hist-2',
    material_id: 'ekonomi-permintaan-penawaran',
    material_title: 'Ekonomi — Permintaan & Penawaran',
    event_type: 'flashcard_session',
    description: 'Sesi Flashcard: menguasai 12 kartu materi',
    timestamp: '2 hari yang lalu',
    score: '12 Kartu'
  },
  {
    id: 'hist-3',
    material_id: 'ekonomi-permintaan-penawaran',
    material_title: 'Ekonomi — Permintaan & Penawaran',
    event_type: 'material_created',
    description: 'Upload file Ekonomi_Permintaan_Penawaran.pdf (2.4 MB)',
    timestamp: '2 hari yang lalu'
  },
  {
    id: 'hist-4',
    material_id: 'biologi-sistem-pernapasan',
    material_title: 'Biologi — Sistem Pernapasan Manusia',
    event_type: 'material_created',
    description: 'Upload file Biologi_Sistem_Pernapasan.docx (1.8 MB)',
    timestamp: '5 hari yang lalu'
  }
];
