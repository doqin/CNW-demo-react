import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * Renders a QR payload to a PNG data URL. While a new payload renders, `ready` is false so a
 * stale code for another amount is never shown.
 */
export function useQrImage(payload, width = 300) {
  const [qr, setQr] = useState(null);
  useEffect(() => {
    let current = true;
    if (payload)
      QRCode.toDataURL(payload, {
        width,
        margin: 4,
        errorCorrectionLevel: 'M',
        color: { dark: '#182d20', light: '#ffffff' },
      })
        .then((url) => {
          if (current) setQr({ payload, url });
        })
        .catch(() => {
          if (current) setQr({ payload, error: true });
        });
    return () => {
      current = false;
    };
  }, [payload, width]);
  const ready = !!payload && qr?.payload === payload;
  return { ready, url: ready && !qr.error ? qr.url : null, error: ready && !!qr.error };
}
