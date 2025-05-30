
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensaje enviado",
        description: "Nos pondremos en contacto contigo pronto.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo lo antes posible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">{t('contact.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">{t('contact.subject')}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">{t('contact.message')}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('contact.send')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">info@planaheadsolutions.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-gray-600">Miami, Florida</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">Horario de atención</p>
                    <p className="text-gray-600">Lun - Vie: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">¿Necesitas ayuda inmediata?</h3>
                <p className="mb-4">
                  Si tienes una pregunta urgente, no dudes en llamarnos durante nuestro horario de atención.
                </p>
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Llamar ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
