export function formatPickupDate(date: string) {
  return new Intl.DateTimeFormat("fi-FI", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("fi-FI", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(date));
}

export function formatWeight(totalGrams: number) {
  return `${(totalGrams / 1000).toLocaleString("fi-FI", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  })} kg`;
}

export function formatQuantity(totalGrams: number) {
  if (totalGrams < 1000) {
    return `${totalGrams} g`;
  }

  return formatWeight(totalGrams);
}

export function formatPhone(phone: string) {
  return phone;
}
