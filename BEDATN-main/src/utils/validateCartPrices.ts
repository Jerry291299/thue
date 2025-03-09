import Cart from "../cart";
import Product from "../product";

export const validateCartPrices = async (userId: string): Promise<boolean> => {
  // Populate cart with product details
  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart) throw new Error("Cart not found");

  let hasPriceChanged = false;

  for (const item of cart.items) {
    const product = item.productId as any; // Type assertion; improve with proper typing
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    // Find the corresponding variant in the product by color
    const variant = product.variants.find((v: any) => v.color === item.color);

    if (!variant) {
      hasPriceChanged = true;
      break;
    }

    // Calculate total price based on whether subVariant exists
    let calculatedPrice = variant.basePrice;

    if (item.subVariant) {
      // Safely handle subVariant being defined
      const subVariant = variant.subVariants.find(
        (sv: any) =>
          sv.specification === item.subVariant?.specification &&
          sv.value === item.subVariant?.value
      );

      if (!subVariant) {
        hasPriceChanged = true;
        break;
      }

      // Add additionalPrice from subVariant
      calculatedPrice += subVariant.additionalPrice || 0;
    } else {
      // If no subVariant in cart item, ensure product variant has no subVariant price affecting it
      // Assuming basePrice is the only price factor when no subVariant is selected
    }

    // Apply discount if it exists
    const discount = variant.discount || 0;
    calculatedPrice -= discount;

    // Compare calculated price with cart item's price
    if (calculatedPrice !== item.price) {
      hasPriceChanged = true;
      break;
    }
  }

  return hasPriceChanged;
};