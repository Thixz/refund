export function FormatCurrency(value: number): string {
  const currency = Intl.NumberFormat("pt-br", {
    style: "currency",
    currency: "BRL",
  });

  return currency.format(value).replace("R$","");
}
