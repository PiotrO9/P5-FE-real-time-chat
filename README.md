# Nuxt 3 + TypeScript + Tailwind CSS

Pusty projekt startowy z Nuxt 3, TypeScript i Tailwind CSS.

## Setup

```bash
# Zainstaluj zależności
npm install
```

## Uruchomienie projektu

```bash
# Development server (http://localhost:3001)
npm run dev

# Build aplikacji
npm run build

# Preview produkcyjnej wersji
npm run preview

# Generate static site
npm run generate
```

## Struktura projektu

```
.
├── assets/
│   └── css/
│       └── tailwind.css           # Konfiguracja Tailwind
├── composables/
│   ├── useSocket.ts               # Composable dla Socket.IO
│   └── useNativeWebSocket.ts     # Composable dla natywnych WebSocketów
├── pages/
│   ├── index.vue                  # Strona główna
│   └── websocket-example.vue     # Przykład WebSocket
├── plugins/
│   └── socket.client.ts           # Plugin Socket.IO
├── app.vue                        # Główny komponent aplikacji
├── nuxt.config.ts                 # Konfiguracja Nuxt
├── tailwind.config.ts             # Konfiguracja Tailwind
├── tsconfig.json                  # Konfiguracja TypeScript
└── package.json                   # Zależności projektu
```

## Technologie

- **Nuxt 3** - Framework Vue.js
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS** - Framework CSS
- **Vue 3** - Composition API
- **Socket.IO Client** - Komunikacja WebSocket
- **VueUse** - Kolekcja composables (w tym useWebSocket)

## Konfiguracja WebSocket

Utwórz plik `.env` w głównym katalogu projektu:

```bash
NUXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

Zmień adres na adres swojego serwera WebSocket.

## Użycie WebSocket

### Socket.IO

```typescript
// W komponencie
const { connect, disconnect, emit, on, isConnected } = useSocket()

// Połącz
connect()

// Wyślij wiadomość
emit('message', { text: 'Hello' })

// Nasłuchuj wiadomości
on('message', (data) => {
  console.log('Otrzymano:', data)
})

// Rozłącz
disconnect()
```

### Native WebSocket (VueUse)

```typescript
const { status, data, send, open, close } = useNativeWebSocket('ws://localhost:8080')

// Wyślij wiadomość
send('Hello')

// Status: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'
watch(status, (newStatus) => {
  console.log('Status:', newStatus)
})
```

## Dokumentacja

- [Nuxt 3](https://nuxt.com/docs)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [VueUse](https://vueuse.org/)

