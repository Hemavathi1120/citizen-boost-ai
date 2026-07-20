import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/company/register")({
  head: () => ({ meta: [{ title: "Employer Registration — SchemeSync Jobs" }] }),
  component: CompanyRegisterPage,
});

const COMPANY_SIZES = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "media", label: "Media & Entertainment" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "other", label: "Other" },
];

function CompanyRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companySize: "",
    industry: "",
    website: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
    passwordConfirm: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof formData
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (value: string, field: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.companyName.trim()) {
      toast.error("Please enter company name");
      return false;
    }
    if (!formData.companyEmail.includes("@")) {
      toast.error("Please enter valid company email");
      return false;
    }
    if (!formData.companySize) {
      toast.error("Please select company size");
      return false;
    }
    if (!formData.industry) {
      toast.error("Please select industry");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.ownerName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.ownerEmail.includes("@")) {
      toast.error("Please enter valid email");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Create auth account
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.ownerEmail,
        password: formData.password,
        options: {
          data: {
            user_type: "employer",
            company_name: formData.companyName,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      // In production, create company record and owner record in database
      // For now, show verification message
      toast.success("Registration successful! Please verify your email.");
      navigate({ to: "/company/verify-email", search: { email: formData.ownerEmail } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SchemeSync Jobs</h1>
              <p className="text-sm text-muted-foreground">For Employers</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Create employer account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1 ? "Company information" : "Your details"}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Inc."
                    value={formData.companyName}
                    onChange={(e) => handleInputChange(e, "companyName")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="companyEmail">Company email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange(e, "companyEmail")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Company website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange(e, "website")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="companySize">Company size</Label>
                  <Select value={formData.companySize} onValueChange={(v) => handleSelectChange(v, "companySize")}>
                    <SelectTrigger id="companySize" className="mt-1.5">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => handleSelectChange(v, "industry")}>
                    <SelectTrigger id="industry" className="mt-1.5">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  onClick={() => validateStep1() && setStep(2)}
                  className="w-full bg-gradient-primary"
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="ownerName">Your full name</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Doe"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange(e, "ownerName")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="ownerEmail">Your email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange(e, "ownerEmail")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange(e, "password")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="passwordConfirm">Confirm password</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="••••••••"
                    value={formData.passwordConfirm}
                    onChange={(e) => handleInputChange(e, "passwordConfirm")}
                    className="mt-1.5"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-primary"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/company/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
