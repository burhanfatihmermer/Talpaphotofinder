import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function KvkkModal({ isOpen, onAccept, onReject }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onReject} />
      
      <div className="glass-card relative z-10 w-full max-w-md overflow-hidden bg-[var(--bg-surface-solid)] border-white/10 p-5 md:p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">KVKK Aydınlatma ve Açık Rıza Metni</h3>
            <p className="text-[9px] text-[var(--text-secondary)] font-medium">Veri Güvenliği ve Gizlilik Bilgilendirmesi</p>
          </div>
        </div>

        {/* Scrollable Text Body */}
        <div className="max-h-[180px] overflow-y-auto pr-2 text-[11px] text-[var(--text-secondary)] space-y-2.5 leading-relaxed border-b border-white/5 pb-3 mb-4 scrollbar-thin">
          <p>
            <strong>TALPA (Türkiye Havayolu Pilotları Derneği)</strong> olarak, gerçekleştirdiğimiz etkinlik sırasında çekilen fotoğraflar arasında kendi fotoğraflarınızı kolayca bulabilmeniz için hazırlanan bu web uygulamasında kişisel verilerinizin güvenliğine büyük önem veriyoruz.
          </p>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, bu uygulamanın çalışma prensipleri ve veri gizliliği kuralları aşağıda açıklanmıştır:
          </p>
          <ol className="list-decimal pl-4 space-y-2">
            <li>
              <strong>İşlenen Veriler ve Amaç:</strong> Kameranız aracılığıyla anlık çekeceğiniz veya cihazınızdan yükleyeceğiniz yüz fotoğrafınız (selfie), yalnızca etkinlik fotoğrafları içerisinde sizin yer aldığınız görselleri tespit etmek amacıyla anlık olarak taranır. Bu işlem, yüzünüzün biyometrik özelliklerinin (referans noktalarının) çıkarılması ve diğer fotoğraflardaki yüzlerle matematiksel olarak karşılaştırılması esasına dayanır.
            </li>
            <li>
              <strong>Sunucusuz ve Güvenli İşleme:</strong> Çektiğiniz veya yüklediğiniz selfie ve bu fotoğraftan elde edilen biyometrik yüz haritalama verileri <strong>kesinlikle hiçbir sunucuya gönderilmez, kaydedilmez ve üçüncü taraflarla paylaşılmaz.</strong> Tüm yüz algılama, vektör çıkarma ve karşılaştırma işlemleri tamamen kendi cihazınızda, tarayıcınız (browser) içerisinde yerel olarak gerçekleştirilir.
            </li>
            <li>
              <strong>Veri Saklama Süresi:</strong> Arama yapmak için kullandığınız selfie görseli ve oluşturulan yüz vektörü, tarayıcı oturumunuzu kapattığınızda veya sayfayı yenilediğinizde bellekten tamamen silinir.
            </li>
            <li>
              <strong>Rıza Beyanı:</strong> "Kabul Ediyorum" seçeneğine tıklayarak, yukarıda belirtilen aydınlatma metnini okuduğunuzu, anladığınızı ve yüz fotoğrafınızın etkinlik fotoğrafları ile karşılaştırılması amacıyla yerel tarayıcınızda işlenmesine <strong>açık rıza gösterdiğinizi</strong> beyan etmiş olursunuz.
            </li>
          </ol>
          <p className="text-[11px] font-semibold text-[var(--text-primary)]">
            Onay vermediğiniz takdirde, yüz tanıma sistemiyle fotoğraflarınızı bulma özelliğini kullanamazsınız.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onReject}
            className="btn btn-outline py-2 px-5 text-xs text-[var(--text-secondary)] hover:text-white"
          >
            Reddediyorum
          </button>
          <button
            onClick={onAccept}
            className="btn btn-primary py-2 px-6 text-xs bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20"
          >
            Okudum, Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  );
}
