import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function DoctorProfileHeader({ data }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{data.nombre}</h2>

          <div className="flex flex-wrap gap-2 mt-2">
            {data.especialidades.map((e, i) => (
              <Badge key={i} className="bg-slate-100 text-slate-700">{e}</Badge>
            ))}
          </div>

          <div className="flex items-center mt-3 text-slate-600">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {data.hospital}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <div className="text-xs font-medium text-slate-500">Email</div>
                  <div className="text-sm text-slate-800">{data.email}</div>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <div className="text-xs font-medium text-slate-500">Teléfono</div>
                  <div className="text-sm text-slate-800">{data.telefono}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-xs font-medium text-slate-500">Fecha de Ingreso</div>
                  <div className="text-sm text-slate-800">{data.fechaIngreso}</div>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-xs font-medium text-slate-500">Dirección</div>
                  <div className="text-sm text-slate-800">{data.direccion}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
