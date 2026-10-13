import { format, parseISO } from "date-fns";

export const formatDate = (s: string) => format(parseISO(s), "dd MMM yyyy");
