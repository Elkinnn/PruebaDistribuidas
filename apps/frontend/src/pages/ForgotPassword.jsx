import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    return (
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 p-6">
            <Card className="w-full max-w-md">
                <div className="border-b border-slate-200/70 p-6">
                    <Logo />
                </div>
                <div className="p-6 grid gap-4">
                    <h1 className="text-lg font-semibold text-slate-900">
                        Recuperar contraseña
                    </h1>
                    {sent ? (
                        <p className="text-sm text-slate-600">
                            Te enviamos un correo con instrucciones (demo). Revisa tu bandeja.
                        </p>
                    ) : (
                        <>
                            <Input
                                label="Correo electrónico"
                                type="email"
                                placeholder="tu-correo@clinix.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button onClick={() => setSent(true)} disabled={!email}>
                                Enviar enlace
                            </Button>
                        </>
                    )}
                    <Link to="/login" className="text-xs text-emerald-700 hover:underline">
                        ← Volver a iniciar sesión
                    </Link>
                </div>
            </Card>
        </div>
    );
}
