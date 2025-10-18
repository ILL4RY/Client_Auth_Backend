"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const usuario_routes_1 = __importDefault(require("./routes/usuario.routes"));
const rol_routes_1 = __importDefault(require("./routes/rol.routes"));
const permiso_routes_1 = __importDefault(require("./routes/permiso.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Rutas
app.use("/usuarios", usuario_routes_1.default);
app.use("/roles", rol_routes_1.default);
app.use("/permisos", permiso_routes_1.default);
// Ruta base
app.get("/", (req, res) => {
    res.send("API del Backend Cliente funcionando ✅");
});
exports.default = app;
//# sourceMappingURL=app.js.map