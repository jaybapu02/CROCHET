/**
 * Product categories.
 * Add a new object here and the navbar, footer, filters and home page
 * will pick it up automatically.
 */

export type Category = {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  image: string;
};

export const categories: Category[] = [
  {
    slug: "flowers",
    name: "Crochet Flowers",
    shortName: "Flowers",
    description: "Bouquets that never wilt — daisies, roses and tulips made stitch by stitch.",
    image: "/images/categories/flowers.webp",
  },
  {
    slug: "bags",
    name: "Crochet Bags",
    shortName: "Bags",
    description: "Roomy totes and pretty mini handbags, crocheted from sturdy cotton yarn.",
    image: "/images/categories/bags.webp",
  },
  {
    slug: "hair-accessories",
    name: "Hair Accessories",
    shortName: "Hair",
    description: "Claw clips, tulip clips, scrunchies and daisy strands with hand-stitched flowers.",
    image: "/images/products/hair-accessories/7.jpeg",
  },
  {
    slug: "clothes",
    name: "Crochet Clothes",
    shortName: "Clothes",
    description: "Granny-square cardigans, baby dresses and beanies for tiny humans.",
    image: "/images/products/clothes/7.jpeg",
  },
  {
    slug: "shoes",
    name: "Baby Shoes",
    shortName: "Shoes",
    description: "Soft-soled crochet sandals in sweet motifs — bears, daisies and kitties.",
    image: "/images/products/shoes/2.jpeg",
  },
  {
    slug: "toys",
    name: "Crochet Toys",
    shortName: "Toys",
    description: "Soft, huggable amigurumi friends for little ones and grown-ups alike.",
    image: "/images/categories/toys.webp",
  },
  {
    slug: "keychains",
    name: "Keychains",
    shortName: "Keychains",
    description: "Tiny handmade charms that make everyday things feel personal.",
    image: "/images/categories/keychains.webp",
  },
  {
    slug: "gifts",
    name: "Gift Hamper",
    shortName: "Gift Hamper",
    description: "Ready-to-gift crochet hampers, packed in a box with a little thank-you note.",
    image: "/images/categories/gifts.webp",
  },
  {
    slug: "decor",
    name: "Home Decor",
    shortName: "Decor",
    description: "Wall hangings, tulips, cushions and little suns for every corner.",
    image: "/images/products/decor/2.jpeg",
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const getCategoryName = (slug: string) => getCategory(slug)?.name ?? slug;
