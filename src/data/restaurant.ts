export const restaurant = {
  name: "Formosa Grill",
  category: "Churrascaria • Pizzaria • Restaurante Familiar",
  phone: "(99) 3317-2043",
  phoneHref: "tel:+559933172043",
  whatsapp: "5599333172043",
  whatsappHref:
    "https://wa.me/559933172043?text=" +
    encodeURIComponent("Olá! Gostaria de fazer um pedido no Formosa Grill."),
  address: {
    street: "Av. Pres. Médici, 2296",
    district: "Formosa",
    city: "Timon - MA",
    zip: "CEP 65636-010",
  },
  mapsUrl: "https://maps.app.goo.gl/K4vABkqjkNgNS52QA",
  mapsEmbed:
    "https://www.google.com/maps?q=Av.+Pres.+Medici,+2296+-+Formosa,+Timon+-+MA,+65636-010&output=embed",
  hours: "Todos os dias, a partir das 18:00",
  priceRange: "R$20 – R$100",
  rating: 4.2,
  reviewCount: 570,
} as const;

export const highlights = [
  {
    emoji: "🥩",
    title: "Carnes na Brasa",
    text: "Cortes nobres selecionados, temperados na medida e assados lentamente na brasa.",
  },
  {
    emoji: "🍕",
    title: "Pizzas Artesanais",
    text: "Massa de fermentação natural, ingredientes frescos e forno em alta temperatura.",
  },
  {
    emoji: "🍺",
    title: "Bebidas Geladas",
    text: "Chopp, cervejas trincando de geladas, drinks autorais e sucos naturais.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Espaço para Família",
    text: "Área infantil monitorada e mesas amplas para receber a família inteira.",
  },
  {
    emoji: "🎵",
    title: "Música Ao Vivo",
    text: "Em dias selecionados, o melhor da música ao vivo para acompanhar o jantar.",
  },
  {
    emoji: "🎉",
    title: "Ambiente Acolhedor",
    text: "Atendimento próximo, iluminação aconchegante e clima perfeito para celebrar.",
  },
] as const;

export const reviews = [
  {
    name: "Ana Carolina",
    stars: 5,
    text: "Excelente comida e ambiente para toda a família. Voltaremos com certeza!",
  },
  {
    name: "Rodrigo Melo",
    stars: 5,
    text: "Carnes muito saborosas e atendimento excelente. A picanha na brasa é imperdível.",
  },
  {
    name: "Juliana Sousa",
    stars: 4,
    text: "Ótimo lugar para jantar com amigos. As pizzas artesanais surpreendem.",
  },
  {
    name: "Marcos Vinícius",
    stars: 5,
    text: "Melhor churrascaria de Timon. Porções generosas e cerveja sempre gelada.",
  },
] as const;

export const faqs = [
  {
    q: "O Formosa Grill aceita reservas?",
    a: "Sim. Você pode reservar sua mesa pelo formulário do site ou pelo telefone (99) 3317-2043. Para grupos e eventos, recomendamos reservar com antecedência.",
  },
  {
    q: "Vocês têm delivery?",
    a: "Sim. Trabalhamos com delivery, retirada na porta e entrega sem contato. Faça seu pedido pelo WhatsApp ou por telefone.",
  },
  {
    q: "O restaurante possui área infantil?",
    a: "Sim, temos uma área infantil para que as crianças se divirtam enquanto a família aproveita a refeição com tranquilidade.",
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "Aceitamos dinheiro, PIX e os principais cartões de crédito e débito.",
  },
  {
    q: "Tem música ao vivo?",
    a: "Sim, em dias selecionados da semana. Acompanhe nossas redes ou ligue para confirmar a programação da noite.",
  },
] as const;

export type MenuItem = {
  name: string;
  description: string;
  price: number;
  tag?: "destaque" | "promo";
};

export const menu: { category: string; items: MenuItem[] }[] = [
  {
    category: "Carnes",
    items: [
      {
        name: "Picanha na Brasa",
        description: "Picanha fatiada na brasa, farofa da casa, vinagrete e arroz. Serve 2 pessoas.",
        price: 109.9,
        tag: "destaque",
      },
      {
        name: "Costela no Bafo",
        description: "Costela bovina assada lentamente por 8 horas, mandioca e molho barbecue.",
        price: 94.9,
      },
      {
        name: "Maminha Grelhada",
        description: "Maminha macia grelhada na brasa com legumes salteados e arroz biro-biro.",
        price: 86.9,
      },
      {
        name: "Mixed Grill Formosa",
        description: "Picanha, linguiça artesanal, frango e coração com acompanhamentos. Serve 3.",
        price: 139.9,
        tag: "promo",
      },
    ],
  },
  {
    category: "Pizzas",
    items: [
      {
        name: "Margherita Artesanal",
        description: "Molho de tomate italiano, muçarela de búfala, manjericão fresco e azeite.",
        price: 54.9,
      },
      {
        name: "Calabresa Especial",
        description: "Calabresa artesanal fatiada, cebola roxa, muçarela e orégano.",
        price: 52.9,
        tag: "destaque",
      },
      {
        name: "Frango com Catupiry",
        description: "Frango desfiado temperado, catupiry cremoso e milho verde.",
        price: 56.9,
      },
      {
        name: "Portuguesa da Casa",
        description: "Presunto, ovos, cebola, azeitonas, pimentão e muçarela.",
        price: 55.9,
      },
    ],
  },
  {
    category: "Porções",
    items: [
      {
        name: "Batata Frita Rústica",
        description: "Batatas rústicas crocantes com alecrim e maionese da casa.",
        price: 39.9,
      },
      {
        name: "Isca de Frango",
        description: "Iscas empanadas crocantes com molho especial. Serve 2 pessoas.",
        price: 46.9,
      },
      {
        name: "Calabresa Acebolada",
        description: "Calabresa artesanal acebolada com pão de alho e vinagrete.",
        price: 44.9,
        tag: "promo",
      },
    ],
  },
  {
    category: "Massas",
    items: [
      {
        name: "Fettuccine ao Molho Branco",
        description: "Fettuccine fresco ao molho branco cremoso com filé em tiras.",
        price: 62.9,
      },
      {
        name: "Espaguete à Bolonhesa",
        description: "Espaguete al dente com molho bolonhesa da casa e parmesão.",
        price: 49.9,
      },
    ],
  },
  {
    category: "Hambúrgueres",
    items: [
      {
        name: "Formosa Burger",
        description: "Blend 180g na brasa, cheddar, bacon crocante, alface e molho especial.",
        price: 42.9,
        tag: "destaque",
      },
      {
        name: "Smash Duplo",
        description: "Dois smash de 100g, queijo prato duplo, picles e cebola caramelizada.",
        price: 44.9,
      },
    ],
  },
  {
    category: "Bebidas",
    items: [
      { name: "Chopp Gelado 500ml", description: "Chopp claro sempre trincando de gelado.", price: 14.9 },
      { name: "Caipirinha da Casa", description: "Cachaça artesanal, limão fresco e gelo.", price: 22.9 },
      { name: "Suco Natural 500ml", description: "Laranja, abacaxi, maracujá ou acerola.", price: 12.9 },
      { name: "Refrigerante Lata", description: "Linha completa gelada.", price: 7.9 },
    ],
  },
  {
    category: "Sobremesas",
    items: [
      { name: "Petit Gâteau", description: "Bolo quente de chocolate com sorvete de creme.", price: 27.9, tag: "destaque" },
      { name: "Pizza de Chocolate", description: "Massa artesanal, chocolate ao leite e morangos.", price: 49.9 },
      { name: "Pudim da Casa", description: "Pudim cremoso de leite condensado com calda de caramelo.", price: 18.9 },
    ],
  },
];

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
