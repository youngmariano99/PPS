import { create } from "https://esm.sh/zustand@4.5.2?external=react,react-dom"

export const useIdentityStore = create((set, get) => ({
    // --- ESTADO ---
    cuentaBase: null,
    contextosDisponibles: [],
    contextoActivo: { 
        tipo: 'USUARIO_BASE', 
        idPerfil: null, 
        slug: null, 
        nombreContexto: 'Cuenta Personal', 
        fotoUrl: null 
    },
    isHydrated: false,
    
    // Estado de UI global para el modal
    showUpgradeModal: false,
    setShowUpgradeModal: (show) => set({ showUpgradeModal: show }),

    // --- ACCIONES BÁSICAS ---
    setContextoActivo: (contexto) => {
        set({ contextoActivo: contexto });
        // Sincronización con localStorage para persistir entre recargas
        try {
            if (typeof window !== "undefined") {
                localStorage.setItem('chamba_active_context', JSON.stringify(contexto));
            }
        } catch(e) {
            console.warn("No se pudo persistir el contexto multi-identidad");
        }
    },
    
    // --- HIDRATACIÓN CENTRALIZADA ---
    // Llamar esto al montar la App o el Navbar
    hydrateFromApi: async (apiUrl, supabaseClient) => {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (!user || !session) {
                set({ 
                    isHydrated: true, 
                    cuentaBase: null, 
                    contextosDisponibles: [], 
                    contextoActivo: { tipo: 'USUARIO_BASE', idPerfil: null, nombreContexto: 'Cuenta Personal', fotoUrl: null } 
                });
                return;
            }

            const response = await fetch(`${apiUrl}/perfiles/me`, {
                headers: {
                    "Authorization": `Bearer ${session.access_token}`,
                    "X-User-Id": user.id
                }
            });

            if (response.ok) {
                const dto = await response.json();
                
                set({
                    cuentaBase: {
                        id: dto.id,
                        nombre: dto.nombre,
                        apellido: dto.apellido,
                        email: dto.email,
                        telefono: dto.telefono,
                        fechaRegistro: dto.fechaRegistro,
                        isPremium: dto.isPremium
                    },
                    contextosDisponibles: dto.contextosDisponibles || []
                });

                // Recuperar estado anterior si existe en localStorage
                if (typeof window !== "undefined") {
                    const savedContext = localStorage.getItem('chamba_active_context');
                    if (savedContext) {
                        try {
                            const parsed = JSON.parse(savedContext);
                            // Validar que el contexto guardado aún exista (por si borró la empresa)
                            const stillExists = parsed.tipo === 'USUARIO_BASE' || 
                                (dto.contextosDisponibles || []).some(c => c.idPerfil === parsed.idPerfil);
                            
                            if (stillExists) {
                                set({ contextoActivo: parsed });
                            } else {
                                set({ contextoActivo: { tipo: 'USUARIO_BASE', idPerfil: null, nombreContexto: 'Cuenta Personal', fotoUrl: null } });
                                localStorage.removeItem('chamba_active_context');
                            }
                        } catch(e) {}
                    }
                }
            }
        } catch (error) {
            console.error("Error al hidratar el Identity Store:", error);
        } finally {
            set({ isHydrated: true });
        }
    },
    
    // --- HELPERS LÓGICOS ---
    isEmpresaActiva: () => get().contextoActivo?.tipo === 'EMPRESA',
    isProveedorActivo: () => get().contextoActivo?.tipo === 'PROVEEDOR',
    isUsuarioBaseActivo: () => get().contextoActivo?.tipo === 'USUARIO_BASE',
}));
