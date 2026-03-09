Google Ads API Test Sonuçları & Analiz

Tarih: 7 Mart 2026

1. Test Süreci:
Google Ads entegrasyonu `veri_akisi_test.ts` ve `test_marketing_flow.ts` betikleri üzerinden doğrudan API çağrıları (REST üzerinden `/v23/customers/{id}/googleAds:searchStream` uç noktası) ile test edilmiştir.

2. Mevcut Durum & Hata:
API'ye yapılan kimlik doğrulama isteği sırasında aşağıdaki hata tespit edildi:

`❌ Failed to get Google Ads Access Token using Refresh Token.`

Bu, sistemde kayıtlı olan Refresh Token'ın (Yenileme Jetonu) geçersiz olduğu, süresinin dolduğu veya Google Cloud Console üzerinden iptal edildiği anlamına gelmektedir.

1. Nedenleri:

- Refresh tokenlar kullanım sıklığına bağlı olarak 6 ay veya daha kısa bir sürede otomatik expire (zaman aşımı) olabilir (Eğer uygulama "Testing" konumundaysa 7 günde düşer).
- Google Ads / Google Cloud platformunda şifre değişimi, güvenlik uyarısı veya manuel oturum kapatma işlemi yapılmış olabilir.
- Token yetkilendirme (Oauth 2.0 flow) sırasında alınan ilk refresh token saklanamamış olabilir.

1. Çözüm Önerisi (Aksiyon Planı):
Google Ads API tarafında yeniden yetkilendirme yapmanız gerekmektedir. Yeni bir Oauth 2.0 ekranına gidip "İzin Ver" diyerek güncel `GOOGLE_ADS_REFRESH_TOKEN` kodunu almalısınız.

- Google Cloud Console üzerinden uygulamanızın "Yayınlandı (In Production)" durumunda olduğundan emin olmalısınız. "Testing" aşamasındaysa Token'larınız her hafta yenilenmek zorundadır.
- Güncel Refresh Token'ı aldıktan sonra `.env` dosyanızdaki `GOOGLE_ADS_REFRESH_TOKEN` alanını güncelleyiniz.
