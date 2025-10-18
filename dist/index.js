"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usuario_routes_1 = __importDefault(require("./routes/usuario.routes"));
const rol_routes_1 = __importDefault(require("./routes/rol.routes"));
const permiso_routes_1 = __importDefault(require("./routes/permiso.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/usuarios", usuario_routes_1.default);
app.use("/roles", rol_routes_1.default);
app.use("/permisos", permiso_routes_1.default);
app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000');
});
//# sourceMappingURL=index.js.map