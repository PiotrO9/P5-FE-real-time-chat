# Real-Time Chat - Nuxt 3 Application

Aplikacja real-time chat z kompleksowym systemem autentykacji opartym o JWT i HttpOnly cookies.

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
├── components/
│   └── ToastContainer.vue         # Komponent powiadomień
├── composables/
│   ├── useAuth.ts                 # Composable autentykacji
│   ├── useUser.ts                 # Composable zarządzania użytkownikami
│   ├── useToast.ts                # Composable powiadomień
│   ├── useSocket.ts               # Composable dla Socket.IO
│   └── useNativeWebSocket.ts     # Composable dla natywnych WebSocketów
├── middleware/
│   ├── auth.ts                    # Middleware ochrony tras
│   └── guest.ts                   # Middleware dla gości
├── pages/
│   ├── index.vue                  # Strona główna (redirect)
│   ├── login.vue                  # Strona logowania
│   ├── register.vue               # Strona rejestracji
│   ├── dashboard.vue              # Panel użytkownika
│   ├── users/
│   │   ├── index.vue              # Lista użytkowników
│   │   └── [id].vue               # Profil użytkownika
│   └── websocket-example.vue     # Przykład WebSocket
├── plugins/
│   └── socket.client.ts           # Plugin Socket.IO
├── types/
│   ├── auth.ts                    # Typy autentykacji
│   ├── user.ts                    # Typy użytkowników
│   └── socket.d.ts                # Typy Socket.IO
├── utils/
│   └── api.ts                     # API client z auto-refresh
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

## System Autentykacji

Aplikacja posiada kompletny system autentykacji z następującymi funkcjonalnościami:

### Strony

- **`/register`** - Rejestracja nowego użytkownika
- **`/login`** - Logowanie użytkownika
- **`/dashboard`** - Panel użytkownika (chroniony)
    - Edycja profilu (username, email)
    - Zmiana hasła
    - Wylogowanie
- **`/users`** - Lista użytkowników z paginacją (chroniony)
- **`/users/:id`** - Profil pojedynczego użytkownika (chroniony)

### Funkcjonalności

✅ **Rejestracja i logowanie** z walidacją formularzy
✅ **JWT + HttpOnly Cookies** dla bezpiecznej autentykacji
✅ **Automatyczne odświeżanie tokenów** (refresh token)
✅ **Middleware ochrony tras** (auth/guest)
✅ **Zarządzanie profilem** użytkownika
✅ **Zmiana hasła** z walidacją
✅ **Lista użytkowników** z paginacją
✅ **Status online/offline** użytkowników
✅ **Toast notifications** dla informacji zwrotnych
✅ **Responsywny design** z Tailwind CSS
✅ **Pełne wsparcie TypeScript**
✅ **Accessibility features** (ARIA, keyboard navigation)

### API Backend

Backend powinien być uruchomiony na `http://localhost:3000` z następującymi endpointami:

#### Auth Endpoints

- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie
- `POST /api/auth/refresh` - Odświeżenie tokenu
- `GET /api/auth/me` - Dane zalogowanego użytkownika

#### User Endpoints

- `GET /api/users?page=1&limit=10` - Lista użytkowników
- `GET /api/users/:id` - Profil użytkownika
- `GET /api/users/:id/status` - Status użytkownika
- `PUT /api/users/:id` - Aktualizacja profilu
- `PATCH /api/users/:id/password` - Zmiana hasła
- `DELETE /api/users/:id` - Usunięcie konta

## Konfiguracja

Utwórz plik `.env` w głównym katalogu projektu:

```bash
NUXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

Zmień adres na adres swojego serwera backend.

## Użycie Composables

### useAuth()

```typescript
const {
	user,
	isAuthenticated,
	isLoading,
	error,
	login,
	register,
	logout,
	checkAuth,
	refreshToken,
	clearError
} = useAuth()

await login({ email: 'user@example.com', password: 'password' })

await register({
	email: 'user@example.com',
	username: 'username',
	password: 'password'
})

await logout()
```

### useUser()

```typescript
const {
	isLoading,
	error,
	getUserProfile,
	getAllUsers,
	getUserStatus,
	updateProfile,
	updatePassword,
	deleteUser,
	clearError
} = useUser()

const user = await getUserProfile('user-id')

const response = await getAllUsers(1, 10)

const status = await getUserStatus('user-id')

await updateProfile('user-id', { username: 'newname' })

await updatePassword('user-id', {
	currentPassword: 'old',
	newPassword: 'new'
})
```

### useToast()

```typescript
const { toasts, success, error, info, warning, clear } = useToast()

success('Operacja zakończona sukcesem!')
error('Wystąpił błąd')
info('Informacja')
warning('Ostrzeżenie')

clear()
```

## Użycie WebSocket

### Socket.IO

```typescript
const { connect, disconnect, emit, on, isConnected } = useSocket()

connect()

emit('message', { text: 'Hello' })

on('message', (data) => {
	console.log('Otrzymano:', data)
})

disconnect()
```

### Native WebSocket (VueUse)

```typescript
const { status, data, send, open, close } = useNativeWebSocket('ws://localhost:8080')

send('Hello')

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
