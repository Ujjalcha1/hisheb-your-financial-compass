import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function OtpVerify() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleResend = () => { setTimer(60); setCanResend(false); };

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-24">
      <h1 className="text-2xl font-bold mb-2">Verify Your Account</h1>
      <p className="text-muted-foreground text-sm mb-8 text-center">Enter the 6-digit code sent to your email</p>

      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
        <InputOTPGroup className="gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot key={i} index={i} className="w-12 h-14 rounded-xl bg-secondary border-border/50 text-lg" />
          ))}
        </InputOTPGroup>
      </InputOTP>

      <div className="mt-4 text-sm text-muted-foreground">
        {canResend ? (
          <button onClick={handleResend} className="text-primary hover:underline">Resend Code</button>
        ) : (
          <span>Resend in {timer}s</span>
        )}
      </div>

      <Button onClick={() => navigate('/login')} className="w-full max-w-sm h-12 rounded-xl font-semibold gradient-primary mt-8" disabled={otp.length < 6}>
        Verify Code
      </Button>
    </div>
  );
}
