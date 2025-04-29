import type {TAuthConfig, TSecureCookieConfig} from "@sh3pherd/shared-types";

export const authConfig: TAuthConfig = {
    privateKey:`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvTDbagzedqPR+
lS5AzQS1Oz1pPlLyI1szi2z75WmYPFUo8jDTA5EJdox2LknLfzyISRYvGTWCrjaz
eNNmzTRlv/Qv7ESMmjstbr+pFVCpNQT1XAQO2AGHssjrAgrXPQNo6kVsqdbZICFP
mh1Q0SOxqFAMxCNJMmRLnjlImTx9Z4lGmmjF1iQWsqYzbZ+jRaw2RaAXD3HvOUQo
RSI5wn7YnCEEUgxCoGUHPtj1IftPdl4wO8q15s8kMYpzYMg3YZG1omb8/39YX6oW
ZuZhx7IFU1sKaIWOgIiHbkAJoPcuBBaUpofOkII8duu8NSva93LCmItJ8uues/37
wzwMYnXHAgMBAAECggEAFKt9nanH9AzeZNKoX+G3grstKZdnZmp+2twU32WUsZZj
oEQL4nB9jfUZk5HaXRFwDM3kEhenNJ/gOVdaQ2Ps9WvQmkSsweYpwNivPCZpmsTI
BI/ItrYHsCgyWBZR5Zap1pl70tf6n82Rv/Yh1iFi/ml5+ZdjEG14YBDpxkKzXEHt
X9LgRQUX3VRsKlc5yMoqLITYQDw/6Jst5RHcdNPo+wH0KGMHZL5e2pvIOYqmety2
oiCUuZa8j5yd8FMujzZ4AiLtVrHbsxsZPTyL0WP4HpLfWA31/+O5J/WuYqBlFoih
RZ3f7m6C/rMjvwhXOrQ6nKnIFzCa327nxbn7a+JY0QKBgQDiRfbwYwJis/aA2xae
BSZN8HUWWJDwq+J6z4wTXGsfoQGsUqraLQ+nliJRT36ERHfz/3fJiofwLD12WCpY
ztqD0YQLIo0n09EiNz5jn/jA5wcl+ZZJYFRzUjRR2/EEjPGJtx1EykEVyU8kaD2+
VNWu7ervxhoWI7iURJtfs530fwKBgQDGU9YH9wz4h4IcnkVEjqdQiQIPgt6orcOx
oUIzUL8DSl3qOxraD3Sjkd1fMsnymnmAQkLSh++tpuUheEDc+1OcUfu5fu4pBMox
gfdNoiJfq27fZlui03d1O81Qs39ZClbxf81MjCcBNVh70v9WMIPB4TtH4/uSX5fC
CP1Dvig6uQKBgQCOfvEcQb3m2t6KF28O5L9SpfOWtv/QEO732GymZLUxnfunwgfG
jkolh+7kteM++L9x8ZhGW+9v2Ox78tn4Q4xpJzC4snGie0pg+dlYdA37rYJa7+st
GnUUithYFOKbswcJa0ALajPCvJwSmXMIwfQvzbT+ewtClgxPk0Ul57+5kQKBgD6O
szRP+Qdrtt7QDYlSdfQxQzUhUppiNRgShY8qKRYgnv8DJbUiquftWqZsnsancyvB
utItjqx3uE6WX99UZ0snkP8xym2l1SFInXkfazhCGvbckosJqOSRuHF8LO8pE8OZ
TGiYzLTU3tQv+dp18xl0sf47K19AR94sd7amhIoBAoGARD0Klspad9zfYwYXqSku
R1X4nWe2MTOEOrwTAZyOISIvivMCk4pH1/Nvc+x/CtWxpUMmYViZaf4u+MStMBmM
q6sl1DR6JV5yTZk5HbrwArTjDCT9lxNAFz71aitovwj7uPXZV+zlfILfj7UmmOuu
xwcegdqlxldcRBGQvX9f8Z0=
-----END PRIVATE KEY-----`,
    publicKey: `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr0w22oM3naj0fpUuQM0E
tTs9aT5S8iNbM4ts++VpmDxVKPIw0wORCXaMdi5Jy388iEkWLxk1gq42s3jTZs00
Zb/0L+xEjJo7LW6/qRVQqTUE9VwEDtgBh7LI6wIK1z0DaOpFbKnW2SAhT5odUNEj
sahQDMQjSTJkS545SJk8fWeJRppoxdYkFrKmM22fo0WsNkWgFw9x7zlEKEUiOcJ+
2JwhBFIMQqBlBz7Y9SH7T3ZeMDvKtebPJDGKc2DIN2GRtaJm/P9/WF+qFmbmYcey
BVNbCmiFjoCIh25ACaD3LgQWlKaHzpCCPHbrvDUr2vdywpiLSfLrnrP9+8M8DGJ1
xwIDAQAB
-----END PUBLIC KEY-----`,
    authToken_TTL_SECONDS: 900,
    refreshTokenTTL_MS: 604800000,
}

export const secureCookieConfig: TSecureCookieConfig =  {
    httpOnly: true,
    secure: false, // TODO: true in production
    sameSite: 'strict',
    maxAge: 604800000 // 7 days
};

