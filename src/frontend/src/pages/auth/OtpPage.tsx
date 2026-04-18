import LogoBadge from "@/components/LogoBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

interface Props {
  mobileNumber: string;
  onVerify: () => void;
  onBack: () => void;
}

const OTP_SLOTS = ["d0", "d1", "d2", "d3", "d4", "d5"] as const;

export default function OtpPage({ mobileNumber, onVerify, onBack }: Props) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onVerify();
    }, 1000);
  };

  const maskedNumber = mobileNumber.replace(/(\d{4})(\d+)(\d{3})/, "$1****$3");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
        >
          <div className="sidebar-gradient px-8 pt-8 pb-10 text-center">
            <div className="flex justify-center mb-3">
              <LogoBadge size="sm" />
            </div>
            <p className="text-white/60 text-xs font-medium mb-3 tracking-wide uppercase">
              Maktab Zaid Bin Sabit
            </p>
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verify OTP</h1>
            <p className="text-white/70 text-sm mt-1">
              Code sent to {maskedNumber}
            </p>
          </div>

          <div className="px-8 py-8">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              data-ocid="otp.cancel_button"
            >
              <ArrowLeft className="w-4 h-4" /> Back to login
            </button>

            <p className="text-sm text-muted-foreground mb-6">
              Enter the 6-digit code sent to your mobile.{" "}
              <span className="text-primary font-medium">
                (Any 6 digits work for demo)
              </span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 justify-center" data-ocid="otp.input">
                {OTP_SLOTS.map((slot, i) => (
                  <Input
                    key={slot}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-12 text-center text-xl font-bold p-0"
                  />
                ))}
              </div>

              {error && (
                <p
                  data-ocid="otp.error_state"
                  className="text-destructive text-sm text-center"
                >
                  {error}
                </p>
              )}

              <Button
                data-ocid="otp.submit_button"
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
