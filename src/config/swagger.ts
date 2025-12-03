import swaggerJSDoc, { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Client Auth",
      version: "1.0.0",
    },
    paths: {},

    components: {
      schemas: {

        UsuarioBase: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nombres: { type: "string" },
            apellido_p: { type: "string" },
            apellido_m: { type: "string" },
            correo: { type: "string", format: "email" },
            pais_celular: { type: "string", nullable: true },
            celular: { type: "string", nullable: true },
            f_nacimiento: { type: "string", format: "date-time", nullable: true },
            tipo_documento: { type: "string" },
            nro_documento: { type: "string" },
            avatar: { type: "string", nullable: true },
            genero: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" }
          }
        },

        Preferencia: {
          type: "object",
          properties: {
            tema: { type: "string" },
            idioma: { type: "string" },
            notificaciones_on: { type: "boolean" },
            marketing_emails: { type: "boolean" },
            privacidad_nivel: { type: "string" }
          }
        },

        Rol: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            descripcion: { type: "string" },
            activo: { type: "boolean" }
          }
        },

        Direccion: {
          type: "object",
          properties: {
            id: { type: "integer" },
            calle: { type: "string" },
            ciudad: { type: "string" },
            estado: { type: "string" },
            pais: { type: "string" },
            codigo_postal: { type: "string" },
            isDefault: { type: "boolean" }
          }
        },

        UsuarioListado: {
          allOf: [
            { $ref: "#/components/schemas/UsuarioBase" },
            {
              type: "object",
              properties: {
                roles: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Rol" }
                }
              }
            }
          ]
        },

        UsuarioDetalle: {
          allOf: [
            { $ref: "#/components/schemas/UsuarioBase" },
            {
              type: "object",
              properties: {
                preferencias: { $ref: "#/components/schemas/Preferencia" },
                direcciones: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Direccion" }
                },
                roles_usuario: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Rol" }
                }
              }
            }
          ]
        },

        UsuarioCrearDTO: {
          type: "object",
          required: [
            "nombres",
            "apellido_p",
            "apellido_m",
            "correo",
            "contraseña",
            "tipo_documento",
            "nro_documento"
          ],
          properties: {
            nombres: { type: "string" },
            apellido_p: { type: "string" },
            apellido_m: { type: "string" },
            correo: { type: "string" },
            pais_celular: { type: "string" },
            celular: { type: "string" },
            contraseña: { type: "string" },
            f_nacimiento: { type: "string", format: "date-time" },
            tipo_documento: { type: "string" },
            nro_documento: { type: "string" },
            avatar: { type: "string" },
            genero: { type: "string" },
            origen: { type: "string" }
          }
        },

        UsuarioExportado: {
          type: "object",
          properties: {
            exportado_en: { type: "string", format: "date-time" },
            usuario: { $ref: "#/components/schemas/UsuarioDetalle" }
          }
        }
      }
    }

  },
  apis: [
    "./src/routes/*.ts",   // para desarrollo
    "./dist/routes/*.js",  // para producción
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;