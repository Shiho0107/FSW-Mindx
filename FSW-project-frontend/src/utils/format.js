export const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** Resolve display name from teacherId + teachers list (or populated teacher object). */
export const getTeacherName = (teacherId, teachers = []) => {
  if (!teacherId) return null;
  if (typeof teacherId === "object" && teacherId.firstName) {
    return `${teacherId.firstName} ${teacherId.lastName ?? ""}`.trim();
  }
  const id = String(teacherId);
  const t = teachers.find((x) => String(x._id) === id);
  return t ? `${t.firstName} ${t.lastName ?? ""}`.trim() : null;
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
