
export function Price({ price, currency }: { price: number; currency: string; }) {
    const decimalPrice = price / 100; // Assuming price is in cents
    if (currency === "USD") {
        return <span>${decimalPrice.toFixed(2)}</span>;
    }
    return (
        <span>
            {decimalPrice.toFixed(2)} {currency}
        </span>
    );
}
