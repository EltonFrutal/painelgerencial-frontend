import { AlertCircle } from "lucide-react";

export default function Chat() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 text-center mb-2">
        Chat IA Desabilitado
      </h3>
      <p className="text-sm text-gray-600 text-center">
        A funcionalidade de chat com IA está temporariamente desabilitada.
      </p>
    </div>
  );
}
