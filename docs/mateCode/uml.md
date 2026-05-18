@startuml
actor "Ana (Cliente)" as Ana
actor "Carlos (Profesional)" as Carlos
actor "TechCorp (Empresa)" as Empresa

rectangle "CHAMBA Marketplace" {
  usecase "Buscar Profesionales Cercanos (PostGIS)" as UC_Buscar
  usecase "Destacar Perfil Premium en Resultados" as UC_Destacar
  usecase "Contactar Profesional" as UC_Contactar
  usecase "Revelar Datos Seguros (Secure Reveal)" as UC_Revelar
  usecase "Calificar Profesional (Prestige V2)" as UC_Calificar
  usecase "Aplicar Cooldown 24hs" as UC_Cooldown
  usecase "Gestionar Portafolio (Cloudinary)" as UC_Portafolio
  usecase "Adquirir Suscripción Premium" as UC_Suscripcion
  usecase "Publicar Oferta de Empleo (Knockout Qs)" as UC_Oferta
  usecase "Postularse con CV Nativo (JSONB)" as UC_Postular
  usecase "Descartar Candidato con Motivo" as UC_Rechazar
}

Ana --> UC_Buscar
UC_Buscar <.. UC_Destacar : <<extend>>
Ana --> UC_Contactar
UC_Contactar ..> UC_Revelar : <<include>>
Ana --> UC_Calificar
UC_Calificar ..> UC_Cooldown : <<include>>

Carlos --> UC_Portafolio
Carlos --> UC_Suscripcion
Carlos --> UC_Postular
Carlos <-- UC_Rechazar : Recibe Notificación

Empresa --> UC_Oferta
Empresa --> UC_Rechazar

@enduml
