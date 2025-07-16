import { Axios, AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { z, ZodError } from "zod";
import fileSvg from "../assets/file.svg";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Upload } from "../components/Upload";
import { api } from "../services/api";
import { CATEGORIES, CATEGORIES_KEYS } from "../utils/categories";
import { FormatCurrency } from "../utils/formatCurrency";

const refundSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Informe um nome claro para sua solicitação" }),
  category: z.string().min(1, { message: "Informe a categoria" }),
  amount: z.coerce
    .number({ message: "Informe um valor válido" })
    .positive({ message: "Informe um valor válido e superior a zero" }),
});

export function Refund() {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (params.id) return navigate(-1);

    try {
      setIsLoading(true);

      if (!file) return alert("Selecione um arquivo de comprovante");

      const fileUploadForm = new FormData();
      fileUploadForm.append("file", file);

      const response = await api.post("/uploads", fileUploadForm);

      const data = refundSchema.parse({
        name,
        category,
        amount: amount.replace(",", "."),
      });

      await api.post("/refunds", {
        ...data,
        filename: response.data.filename,
      });

      navigate("/confirm", { state: { fromSubmit: true } });
    } catch (error) {
      if (error instanceof ZodError) return alert(error.issues[0].message);

      if (error instanceof AxiosError)
        return alert(error.response?.data.message);

      alert("Não foi possível realizar a solicitação");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRefund(id: string) {
    try {
      const { data } = await api.get<RefundApiResponse>(`/refunds/${id}`);

      setName(data.name);
      setCategory(data.category);
      setAmount(FormatCurrency(data.amount));
      setFileUrl(data.filename);
    } catch (error) {
      if (error instanceof AxiosError)
        return alert(error.response?.data.message);

      return alert("Não foi possível carregar.");
    }
  }

  useEffect(() => {
    if (params.id) fetchRefund(params.id);
  }, [params.id]);

  return (
    <form
      onSubmit={onSubmit}
      className="bg-gray-500 w-full rounded-xl flex flex-col p-10 gap-6 lg:min-w-[512px]"
    >
      <header>
        <h1 className="text-xl font-bold text-gray-100">
          Solitação de reembolso
        </h1>
        <p className="text-sm text-gray-200 mt-2 mb-4">
          Dados da despesa para solicitar reembolso.
        </p>
      </header>

      <Input
        required
        legend="Nome da solicitação"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!!params.id}
      />

      <div className="flex gap-4">
        <Select
          required
          legend="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={!!params.id}
        >
          {CATEGORIES_KEYS.map((category) => (
            <option key={category} value={category}>
              {CATEGORIES[category].name}
            </option>
          ))}
        </Select>

        <Input
          legend="Valor"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!!params.id}
        />
      </div>

      {params.id && fileUrl ? (
        <a
          href={`http://localhost:3333/uploads/${fileUrl}`}
          target="_blank"
          className="text-sm text-green-100 font-semibold flex items-center justify-center gap-2 my-6 hover:opacity-65 transition ease-linear"
        >
          <img src={fileSvg} alt="Ícone de arquivo" />
          Abrir Comprovante
        </a>
      ) : (
        <Upload
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
          filename={file && file.name}
          disabled={!!params.id}
        />
      )}

      <Button type="submit" isLoading={isLoading}>
        {params.id ? "Voltar" : "Enviar"}
      </Button>
    </form>
  );
}
