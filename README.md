# Tienda Virtual - API RESTful

Backend de una tienda virtual desarrollado con Node.js, Express, MongoDB, Mongoose y JSON Web Tokens (JWT), siguiendo el patrón Modelo-Vista-Controlador (MVC).

## Requisitos

- Node.js 18 o superior
- MongoDB (local o MongoDB Atlas)

## Instalación y ejecución

```bash
npm install
cp .env.example .env      # En Windows: copy .env.example .env
# Editar .env con la URI de MongoDB y la clave JWT_SECRET
npm run seed              # Carga productos de prueba
npm run dev               # Levanta el servidor con nodemon (o: npm start)
```

## Endpoints

| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| POST | /api/auth/register | No | Registra un usuario |
| POST | /api/auth/login | No | Inicia sesión y devuelve un token JWT |
| POST | /api/orders | Sí (Bearer token) | Crea una orden y descuenta el stock |
| PUT | /api/orders/:id/return | Sí (Bearer token) | Devuelve una orden y restaura el stock |

## Integrantes

- Lima
- Aíta
- Benites
- Subia
