export interface ContactRow {
  id: number;
  phonenumber: string | null;
  email: string | null;
  linkedid: number | null;
  linkprecedence: "primary" | "secondary";
  createdat: Date;
  updatedat: Date;
  deletedAt: Date | null;
}
