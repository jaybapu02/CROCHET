/**
 * 🌸 SAMPLE REVIEWS
 * Demo data for the reviews page and home page preview.
 * Replace with real customer reviews later — keep the shape of the object.
 */

export type Review = {
  id: string;
  name: string;
  /** 1–5 */
  rating: number;
  date: string;
  /** ISO date string used for sorting */
  isoDate: string;
  product: string;
  text: string;
};

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Ananya Sharma",
    rating: 5,
    date: "August 2026",
    isoDate: "2026-08-14",
    product: "Crochet Daisy Bouquet",
    text: "The daisies looked even prettier in person. I ordered them for my sister’s birthday and she has them on her desk ever since — people keep asking where they’re from.",
  },
  {
    id: "r2",
    name: "Meera Iyer",
    rating: 5,
    date: "July 2026",
    isoDate: "2026-07-28",
    product: "Handmade Crochet Tote Bag",
    text: "Sturdy, roomy and the stitching is so neat. I use it for work every single day and it still looks new. The little flower detail is my favourite part.",
  },
  {
    id: "r3",
    name: "Riya Kapoor",
    rating: 5,
    date: "July 2026",
    isoDate: "2026-07-11",
    product: "Crochet Baby Beanie",
    text: "Ordered a beanie for my nephew’s first birthday. It’s soft, safe for a baby and beautifully finished. Packaging was lovely too — felt like a real gift.",
  },
  {
    id: "r4",
    name: "Sneha Patel",
    rating: 4,
    date: "June 2026",
    isoDate: "2026-06-25",
    product: "Crochet Flower Hair Claw",
    text: "The colours are exactly as shown and the clip holds my hair without slipping all day. Took a week to arrive but the seller kept me updated the whole time.",
  },
  {
    id: "r5",
    name: "Kavya Nair",
    rating: 5,
    date: "June 2026",
    isoDate: "2026-06-09",
    product: "Custom Crochet Gift Set",
    text: "I asked for a gift with my friend’s name in the colours of her favourite saree. They nailed it. She called me the moment she opened it.",
  },
  {
    id: "r6",
    name: "Pooja Verma",
    rating: 5,
    date: "May 2026",
    isoDate: "2026-05-30",
    product: "Crochet Rose Bouquet",
    text: "Gave these to my mum on Mother’s Day. The roses are so neatly made that she thought they were real from across the room. Worth every rupee.",
  },
  {
    id: "r7",
    name: "Ishita Bose",
    rating: 5,
    date: "May 2026",
    isoDate: "2026-05-18",
    product: "Crochet Bunny",
    text: "The bunny is my daughter’s new bedtime companion. Excellent quality yarn, no loose threads, and the ears are stitched firmly. Highly recommend.",
  },
  {
    id: "r8",
    name: "Tanvi Deshmukh",
    rating: 4,
    date: "April 2026",
    isoDate: "2026-04-22",
    product: "Crochet Mini Handbag",
    text: "Cute and well made. I get compliments every time I carry it. Would love more colour options in the future!",
  },
  {
    id: "r9",
    name: "Aarti Singh",
    rating: 5,
    date: "April 2026",
    isoDate: "2026-04-05",
    product: "Crochet Flower Keychain",
    text: "Bought six of these as return favours for a housewarming. Everyone loved them. Ordering on WhatsApp was quick and easy.",
  },
  {
    id: "r10",
    name: "Neha Gupta",
    rating: 5,
    date: "March 2026",
    isoDate: "2026-03-21",
    product: "Crochet Sunflower Pinafore Dress",
    text: "So soft and light — perfect for my daughter. You can feel the hours of work in it. It’s become a family keepsake already.",
  },
  {
    id: "r11",
    name: "Divya Menon",
    rating: 5,
    date: "March 2026",
    isoDate: "2026-03-08",
    product: "Crochet Baby Sandals",
    text: "Everyone at the naming ceremony kept stopping to ask where they were from. Lovely craftsmanship.",
  },
  {
    id: "r12",
    name: "Simran Kaur",
    rating: 5,
    date: "February 2026",
    isoDate: "2026-02-16",
    product: "Crochet Tulip Bouquet",
    text: "Ordered for a friend who moved cities — she says it brightens up her whole shelf. The wrap and ribbon made it feel very premium.",
  },
];

export const averageRating =
  Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
