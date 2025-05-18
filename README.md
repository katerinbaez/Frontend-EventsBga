# 🎭 EventsBga - Plataforma Cultural de Bucaramanga

<div align="center">
  <img src="./assets/images/icon.png" alt="EventsBga Logo" width="200"/>
  <br/>
  <p><i>Conectando artistas, espacios culturales y público en Bucaramanga</i></p>
</div>

## 📋 Índice

- [🌟 Descripción](#-descripción)
- [✨ Características](#-características)
- [🚀 Instalación](#-instalación)
- [🛠️ Tecnologías](#️-tecnologías)
- [📱 Capturas de Pantalla](#-capturas-de-pantalla)
- [📊 Estructura del Proyecto](#-estructura-del-proyecto)
- [👥 Roles de Usuario](#-roles-de-usuario)
- [🔄 Flujo de Trabajo](#-flujo-de-trabajo)
- [🌐 Geolocalización](#-geolocalización)
- [📅 Gestión de Eventos](#-gestión-de-eventos)
- [🤝 Contribución](#-contribución)
- [📞 Contacto](#-contacto)

## 🌟 Descripción

EventsBga es una plataforma integral diseñada para conectar la escena cultural de Bucaramanga, facilitando la interacción entre artistas, espacios culturales y el público. La aplicación permite la gestión de perfiles artísticos, espacios culturales, programación de eventos, y visualización del calendario cultural de la ciudad.

Con una interfaz profesional que utiliza colores vibrantes y contrastantes, destacando el color de acento rojo (#FF3A5E), EventsBga ofrece una experiencia de usuario intuitiva y atractiva para todos los participantes del ecosistema cultural.

## ✨ Características

- 🎨 **Perfiles de Artistas**: Registro y gestión de perfiles artísticos con información detallada
- 🏛️ **Espacios Culturales**: Visualización y administración de espacios culturales con detalles de ubicación, capacidad y horarios
- 📅 **Calendario de Eventos**: Visualización de eventos culturales con filtrado por categorías y fechas
- 🔍 **Búsqueda Avanzada**: Localización de eventos, artistas y espacios mediante filtros personalizados
- 📱 **Experiencia Responsive**: Diseño adaptado para dispositivos móviles y tablets
- 🌍 **Geolocalización**: Búsqueda de espacios culturales cercanos mediante OpenStreetMap
- 🔐 **Sistema de Roles**: Gestión de permisos para usuarios, artistas, gestores culturales y administradores
- 📊 **Panel Administrativo**: Métricas y gestión de usuarios para administradores
- 🗓️ **Gestión de Horarios**: Bloqueo y desbloqueo de franjas horarias para espacios culturales
- 💾 **Persistencia de Datos**: Almacenamiento seguro de información en la nube

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tuusuario/EventsBga.git
   cd EventsBga
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crea un archivo `.env` basado en `.env.example`
   - Configura las credenciales de Auth0 y la URL del backend

4. **Iniciar la aplicación**
   ```bash
   npx expo start
   ```

5. **Opciones de ejecución**
   - Presiona `a` para abrir en emulador Android
   - Presiona `i` para abrir en simulador iOS
   - Escanea el código QR con la app Expo Go en tu dispositivo

## 🛠️ Tecnologías

- **Frontend**:
  - [React Native](https://reactnative.dev/) - Framework principal
  - [Expo](https://expo.dev/) - Plataforma de desarrollo
  - [React Navigation](https://reactnavigation.org/) - Navegación entre pantallas
  - [Axios](https://axios-http.com/) - Cliente HTTP para API
  - [React Native Calendars](https://github.com/wix/react-native-calendars) - Componentes de calendario

- **Geolocalización**:
  - [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) - Acceso a ubicación
  - [OpenStreetMap/Nominatim](https://nominatim.org/) - Servicios de mapas y geocodificación

- **Autenticación**:
  - [Auth0](https://auth0.com/) - Sistema de autenticación y autorización
  - [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/) - Flujos de autenticación

- **Almacenamiento**:
  - [Async Storage](https://react-native-async-storage.github.io/async-storage/) - Almacenamiento local
  - [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/) - Almacenamiento seguro

## 📱 Capturas de Pantalla

<div align="center">
  <p>Pantallas principales de la aplicación EventsBga</p>
  <br/>
  <p>
    <i>Pantalla de inicio | Calendario de eventos | Perfil de artista | Espacio cultural</i>
  </p>
</div>

## 📊 Estructura del Proyecto

```
EventsBga/
├── assets/                 # Recursos estáticos (imágenes, fuentes, animaciones)
├── components/             # Componentes React Native
│   ├── features/           # Componentes organizados por características
│   │   ├── admin/          # Componentes de administración
│   │   │   ├── metrics/    # Métricas y estadísticas
│   │   │   └── users/      # Gestión de usuarios
│   │   ├── artists/        # Componentes relacionados con artistas
│   │   │   ├── forms/      # Formularios para artistas
│   │   │   ├── modals/     # Ventanas modales
│   │   │   ├── sections/   # Secciones de perfil
│   │   │   ├── services/   # Servicios de datos
│   │   │   ├── ui/         # Componentes de UI
│   │   │   └── views/      # Vistas principales
│   │   ├── auth/           # Componentes de autenticación
│   │   │   ├── admin/      # Autenticación de administradores
│   │   │   └── login/      # Pantallas de inicio de sesión
│   │   ├── calendar/       # Componentes de calendario
│   │   │   └── views/      # Vistas principales del calendario
│   │   ├── dashboard/      # Componentes de paneles principales
│   │   │   ├── HomeScreen/ # Pantalla de inicio
│   │   │   ├── admin/      # Panel de administrador
│   │   │   │   ├── elements/  # Elementos de UI
│   │   │   │   └── views/     # Vistas principales
│   │   │   ├── artist/     # Panel de artista
│   │   │   │   ├── elements/  # Elementos de UI
│   │   │   │   ├── services/  # Servicios de datos
│   │   │   │   └── views/     # Vistas principales
│   │   │   ├── manager/    # Panel de gestor cultural
│   │   │   │   ├── elements/  # Elementos de UI
│   │   │   │   ├── services/  # Servicios de datos
│   │   │   │   └── views/     # Vistas principales
│   │   │   └── user/       # Panel de usuario
│   │   │       ├── elements/  # Elementos de UI
│   │   │       ├── services/  # Servicios de datos
│   │   │       └── views/     # Vistas principales
│   │   ├── events/         # Componentes de gestión de eventos
│   │   │   ├── hooks/      # Hooks personalizados
│   │   │   ├── sections/   # Secciones de eventos
│   │   │   ├── services/   # Servicios de datos
│   │   │   ├── ui/         # Componentes de UI
│   │   │   ├── utils/      # Utilidades
│   │   │   └── views/      # Vistas principales
│   │   ├── favorites/      # Componentes de favoritos
│   │   │   ├── hooks/      # Hooks personalizados
│   │   │   ├── services/   # Servicios de datos
│   │   │   ├── ui/         # Componentes de UI
│   │   │   └── views/      # Vistas principales
│   │   ├── geolocation/    # Componentes de geolocalización
│   │   │   ├── hooks/      # Hooks personalizados
│   │   │   ├── services/   # Servicios de datos
│   │   │   ├── ui/         # Componentes de UI
│   │   │   └── views/      # Vistas principales
│   │   ├── notifications/  # Componentes de notificaciones
│   │   │   ├── hooks/      # Hooks personalizados
│   │   │   ├── services/   # Servicios de datos
│   │   │   ├── ui/         # Componentes de UI
│   │   │   ├── utils/      # Utilidades
│   │   │   └── Views/      # Vistas principales
│   │   ├── requests/       # Componentes de solicitudes
│   │   │   ├── hooks/      # Hooks personalizados
│   │   │   ├── services/   # Servicios de datos
│   │   │   ├── ui/         # Componentes de UI
│   │   │   ├── utils/      # Utilidades
│   │   │   └── views/      # Vistas principales
│   │   └── spaces/         # Componentes de espacios culturales
│   │       ├── forms/      # Formularios para espacios
│   │       ├── hooks/      # Hooks personalizados
│   │       ├── services/   # Servicios para manejo de datos
│   │       ├── ui/         # Componentes de UI específicos
│   │       ├── utils/      # Utilidades (geolocalización, etc.)
│   │       └── views/      # Vistas principales
│   ├── ui/                 # Componentes de UI reutilizables
├── constants/              # Constantes y configuración
├── context/                # Contextos de React (Auth, etc.)
├── hooks/                  # Hooks personalizados
├── polyfills/              # Polyfills para compatibilidad
├── scripts/                # Scripts de utilidad
├── styles/                 # Estilos globales
└── app/                    # Estructura de navegación (Expo Router)
    ├── (tabs)/             # Navegación por pestañas
```

## 👥 Roles de Usuario

EventsBga implementa un sistema de roles basado en solicitudes aprobadas:

- **Usuario**: Acceso básico para visualizar eventos y perfiles
- **Artista**: Gestión de perfil artístico y solicitud de eventos
- **Gestor Cultural**: Administración de espacios y aprobación de solicitudes
- **Administrador**: Control total del sistema y métricas

Los roles se determinan según las solicitudes aprobadas en la tabla RoleRequests, donde:
- "Artista" en RoleRequests → "artist" en el frontend
- "GestorEventos" en RoleRequests → "manager" en el frontend

## 🔄 Flujo de Trabajo

1. **Registro y Autenticación**:
   - Los usuarios se registran mediante Auth0
   - Pueden solicitar roles de Artista o Gestor Cultural

2. **Creación de Perfiles**:
   - Los artistas completan su perfil con información artística
   - Los gestores culturales registran sus espacios con detalles y horarios

3. **Gestión de Eventos**:
   - Los artistas solicitan espacios para eventos
   - Los gestores aprueban solicitudes y gestionan disponibilidad
   - Los eventos aprobados aparecen en el calendario público

4. **Experiencia del Usuario**:
   - Búsqueda de eventos por categoría, fecha o ubicación
   - Visualización de perfiles de artistas y espacios culturales
   - Seguimiento de artistas y espacios favoritos

## 🌐 Geolocalización

La aplicación implementa geolocalización utilizando OpenStreetMap (Nominatim) como alternativa a Google Maps API:

- Obtención de ubicación actual del usuario con alta precisión
- Geocodificación inversa para convertir coordenadas en direcciones
- Búsqueda de lugares cercanos con sistema de debouncing (300ms)
- Priorización de resultados en Bucaramanga y Colombia
- Visualización de distancia exacta a cada lugar

## 📅 Gestión de Eventos

El sistema de gestión de eventos incluye:

- **Calendario Visual**: Visualización de eventos por día/mes
- **Bloqueo de Horarios**: Sistema para reservar franjas horarias en espacios
- **Aprobación de Solicitudes**: Flujo de trabajo para gestionar peticiones
- **Estados de Eventos**: Seguimiento desde solicitud hasta finalización
- **Métricas de Asistencia**: Conteo real de asistentes a eventos culturales

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas contribuir al proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva característica'`)
4. Sube tus cambios (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

