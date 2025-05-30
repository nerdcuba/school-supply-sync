
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  es: {
    // Navbar
    'nav.home': 'Inicio',
    'nav.schools': 'Escuelas',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.contact': 'Contacto',
    'nav.cart': 'Carrito',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',

    // Home page
    'home.title': 'Simplifica el Regreso a Clases',
    'home.subtitle': 'Encuentra las listas de útiles escolares oficiales de tu escuela y ordena todo lo que necesitas en un solo lugar.',
    'home.cta': 'Buscar mi Escuela',
    'home.features.title': '¿Por qué elegir Plan Ahead Solutions?',
    'home.features.official.title': 'Listas Oficiales',
    'home.features.official.desc': 'Accede a las listas de útiles escolares oficiales de tu distrito escolar.',
    'home.features.convenient.title': 'Compra Conveniente',
    'home.features.convenient.desc': 'Ordena todos los útiles necesarios desde la comodidad de tu hogar.',
    'home.features.organized.title': 'Mantente Organizado',
    'home.features.organized.desc': 'Lleva un registro de tus compras y listas por grado.',

    // Schools page
    'schools.title': 'Encuentra tu Escuela',
    'schools.subtitle': 'Busca y selecciona tu escuela para acceder a las listas de útiles específicas por grado.',
    'schools.search': 'Buscar escuela...',
    'schools.select': 'Selecciona tu Escuela',
    'schools.selectDesc': 'Encuentra tu escuela en nuestra lista y accede a las listas de útiles específicas para cada grado.',
    'schools.viewSupplies': 'Ver Listas de Útiles',
    'schools.students': 'estudiantes',
    'schools.notFound': 'No se encontraron escuelas',
    'schools.notFoundDesc': 'No hay escuelas que coincidan con tu búsqueda. Intenta con otro término.',

    // Supply List
    'supplies.title': 'Listas de Útiles',
    'supplies.selectGrade': 'Selecciona el grado de tu hijo/a para ver la lista completa de útiles escolares disponible como pack.',
    'supplies.pack': 'Pack',
    'supplies.packComplete': 'Pack Completo',
    'supplies.items': 'artículos incluidos',
    'supplies.viewPack': 'Ver Pack Completo',
    'supplies.buyPack': 'Compra el Pack Completo',
    'supplies.saveTime': 'Todos los útiles necesarios para {grade} en un solo pack. ¡Ahorra tiempo y dinero!',
    'supplies.addPack': 'Agregar Pack',
    'supplies.content': 'Contenido del pack por categoría:',
    'supplies.allPack': 'Todo el pack',
    'supplies.included': 'Artículos incluidos en el pack:',
    'supplies.total': 'Total del pack:',
    'supplies.quantity': 'Cantidad incluida:',
    'supplies.brand': 'Marca recomendada:',
    'supplies.subtotal': 'Subtotal en pack',
    'supplies.download': 'Descargar',
    'supplies.print': 'Imprimir',

    // Cart
    'cart.title': 'Carrito de Compras',
    'cart.empty': 'Tu carrito está vacío',
    'cart.emptyDesc': 'Agrega algunos packs de útiles escolares para comenzar.',
    'cart.continueShopping': 'Continuar Comprando',
    'cart.quantity': 'Cantidad',
    'cart.price': 'Precio',
    'cart.total': 'Total',
    'cart.checkout': 'Proceder al Pago',

    // Checkout
    'checkout.title': 'Finalizar Compra',
    'checkout.shipping': 'Información de Envío',
    'checkout.firstName': 'Nombre',
    'checkout.lastName': 'Apellido',
    'checkout.email': 'Correo Electrónico',
    'checkout.phone': 'Teléfono',
    'checkout.address': 'Dirección',
    'checkout.city': 'Ciudad',
    'checkout.state': 'Estado',
    'checkout.zipCode': 'Código Postal',
    'checkout.summary': 'Resumen del Pedido',
    'checkout.placeOrder': 'Realizar Pedido',
    'checkout.cancel': 'Cancelar',

    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.loginDesc': 'Ingresa a tu cuenta de Plan Ahead Solutions',
    'auth.register': 'Registrarse',
    'auth.registerDesc': 'Crea tu cuenta de Plan Ahead Solutions',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.firstName': 'Nombre',
    'auth.lastName': 'Apellido',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.hasAccount': '¿Ya tienes una cuenta?',
    'auth.loginHere': 'Inicia sesión aquí',
    'auth.registerHere': 'Regístrate aquí',

    // Dashboard
    'dashboard.welcome': 'Bienvenido, {name}!',
    'dashboard.title': 'Panel de Control',
    'dashboard.purchaseHistory': 'Historial de Compras',
    'dashboard.noPurchases': 'No hay compras registradas',
    'dashboard.noPurchasesDesc': 'Cuando realices tu primera compra, aparecerá aquí.',
    'dashboard.orderDate': 'Fecha del Pedido',
    'dashboard.items': 'Artículos',

    // Footer
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.account': 'Mi Cuenta',
    'footer.contact': 'Contacto',
    'footer.rights': 'Todos los derechos reservados.',

    // How it works
    'howItWorks.title': 'Cómo Funciona',
    'howItWorks.subtitle': 'Obtén los útiles escolares de tu hijo en solo 3 pasos simples',
    'howItWorks.step1.title': 'Encuentra tu Escuela',
    'howItWorks.step1.desc': 'Busca y selecciona la escuela de tu hijo en nuestro directorio.',
    'howItWorks.step2.title': 'Selecciona el Grado',
    'howItWorks.step2.desc': 'Elige el grado de tu hijo para ver la lista oficial de útiles.',
    'howItWorks.step3.title': 'Compra el Pack',
    'howItWorks.step3.desc': 'Agrega el pack completo al carrito y finaliza tu compra.',

    // Contact
    'contact.title': 'Contáctanos',
    'contact.subtitle': 'Estamos aquí para ayudarte con cualquier pregunta sobre nuestros servicios',
    'contact.name': 'Nombre',
    'contact.subject': 'Asunto',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar Mensaje',

    // Messages
    'messages.packAdded': 'Pack agregado al carrito',
    'messages.packAddedDesc': 'Pack completo de {grade} agregado a tu carrito con {count} artículos.',
    'messages.downloading': 'Descargando lista',
    'messages.downloadingDesc': 'La lista de útiles se descargará en formato PDF.',
    'messages.printing': 'Imprimiendo lista',
    'messages.printingDesc': 'Se abrirá el diálogo de impresión.',
    'messages.welcome': '¡Bienvenido!',
    'messages.welcomeDesc': 'Has iniciado sesión correctamente.',
    'messages.loginError': 'Error de inicio de sesión',
    'messages.loginErrorDesc': 'Verifica tu email y contraseña.',
    'messages.error': 'Error',
    'messages.errorDesc': 'Ha ocurrido un error. Inténtalo de nuevo.',

    // Common
    'common.close': 'Cerrar',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.loading': 'Cargando...',
    
    admin: {
      login: 'Acceso Administrador',
      loginDesc: 'Ingresa tus credenciales de administrador',
      username: 'Usuario',
      welcome: 'Bienvenido Administrador',
      loginSuccess: 'Acceso exitoso al panel de administración',
      invalidCredentials: 'Credenciales incorrectas',
      logout: 'Cerrar Sesión',
      dashboard: 'Panel de Administración',
      analytics: 'Analíticas',
      schools: 'Escuelas',
      packs: 'Packs',
      users: 'Usuarios',
      settings: 'Configuración',
      
      // Analytics
      totalSales: 'Ventas Totales',
      totalOrders: 'Pedidos Totales',
      avgOrderValue: 'Valor Promedio',
      totalUsers: 'Usuarios Totales',
      fromLastMonth: 'vs mes anterior',
      newThisMonth: 'nuevos este mes',
      salesTrend: 'Tendencia de Ventas',
      salesTrendDesc: 'Ventas de los últimos 6 meses',
      topPacks: 'Packs Más Vendidos',
      topPacksDesc: 'Distribución por popularidad',
      monthlyOrders: 'Pedidos Mensuales',
      monthlyOrdersDesc: 'Número de pedidos por mes',
      sales: 'Ventas',
      orders: 'Pedidos',
      
      // School Management
      schoolManagement: 'Gestión de Escuelas',
      schoolManagementDesc: 'Administra las escuelas registradas en la plataforma',
      addSchool: 'Añadir Escuela',
      editSchool: 'Editar Escuela',
      addSchoolDesc: 'Completa la información de la nueva escuela',
      editSchoolDesc: 'Modifica la información de la escuela',
      schoolName: 'Nombre de la Escuela',
      location: 'Ubicación',
      contactEmail: 'Email de Contacto',
      contactPhone: 'Teléfono de Contacto',
      schoolAdded: 'Escuela Añadida',
      schoolAddedDesc: 'La escuela se ha añadido exitosamente',
      schoolUpdated: 'Escuela Actualizada',
      schoolUpdatedDesc: 'La información de la escuela se ha actualizado',
      schoolDeleted: 'Escuela Eliminada',
      schoolDeletedDesc: 'La escuela se ha eliminado del sistema',
      
      // Pack Management
      packManagement: 'Gestión de Packs',
      packManagementDesc: 'Administra los packs de útiles escolares',
      addPack: 'Añadir Pack',
      editPack: 'Editar Pack',
      addPackDesc: 'Crea un nuevo pack de útiles escolares',
      editPackDesc: 'Modifica la información del pack',
      packName: 'Nombre del Pack',
      price: 'Precio',
      school: 'Escuela',
      grade: 'Grado',
      description: 'Descripción',
      items: 'Artículos',
      onePerLine: 'uno por línea',
      selectSchool: 'Seleccionar Escuela',
      selectGrade: 'Seleccionar Grado',
      packAdded: 'Pack Añadido',
      packAddedDesc: 'El pack se ha añadido exitosamente',
      packUpdated: 'Pack Actualizado',
      packUpdatedDesc: 'La información del pack se ha actualizado',
      packDeleted: 'Pack Eliminado',
      packDeletedDesc: 'El pack se ha eliminado del sistema',
      
      // User Management
      userManagement: 'Gestión de Usuarios',
      userManagementDesc: 'Administra los usuarios registrados en la plataforma',
      registrationDate: 'Fecha de Registro',
      totalPurchases: 'Compras Totales',
      totalSpent: 'Total Gastado',
      lastLogin: 'Último Acceso',
      userDetails: 'Detalles del Usuario',
      userDetailsDesc: 'Información detallada del usuario',
      userDeleted: 'Usuario Eliminado',
      userDeletedDesc: 'El usuario se ha eliminado del sistema',
      
      // Admin Settings
      adminCredentials: 'Credenciales de Administrador',
      adminCredentialsDesc: 'Actualiza las credenciales de acceso al panel',
      currentPassword: 'Contraseña Actual',
      newUsername: 'Nuevo Usuario',
      newPassword: 'Nueva Contraseña',
      updateCredentials: 'Actualizar Credenciales',
      credentialsUpdated: 'Credenciales Actualizadas',
      credentialsUpdatedDesc: 'Las credenciales se han actualizado exitosamente',
      systemInfo: 'Información del Sistema',
      systemInfoDesc: 'Información general de la plataforma',
      version: 'Versión',
      lastUpdate: 'Última Actualización',
      totalSchools: 'Total Escuelas',
      totalPacks: 'Total Packs',
    }
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.schools': 'Schools',
    'nav.howItWorks': 'How It Works',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',

    // Home page
    'home.title': 'Simplify Back to School',
    'home.subtitle': 'Find your school\'s official supply lists and order everything you need in one place.',
    'home.cta': 'Find My School',
    'home.features.title': 'Why Choose Plan Ahead Solutions?',
    'home.features.official.title': 'Official Lists',
    'home.features.official.desc': 'Access official school supply lists from your school district.',
    'home.features.convenient.title': 'Convenient Shopping',
    'home.features.convenient.desc': 'Order all necessary supplies from the comfort of your home.',
    'home.features.organized.title': 'Stay Organized',
    'home.features.organized.desc': 'Keep track of your purchases and lists by grade.',

    // Schools page
    'schools.title': 'Find Your School',
    'schools.subtitle': 'Search and select your school to access grade-specific supply lists.',
    'schools.search': 'Search school...',
    'schools.select': 'Select Your School',
    'schools.selectDesc': 'Find your school in our list and access specific supply lists for each grade.',
    'schools.viewSupplies': 'View Supply Lists',
    'schools.students': 'students',
    'schools.notFound': 'No schools found',
    'schools.notFoundDesc': 'No schools match your search. Try a different term.',

    // Supply List
    'supplies.title': 'Supply Lists',
    'supplies.selectGrade': 'Select your child\'s grade to see the complete school supply list available as a pack.',
    'supplies.pack': 'Pack',
    'supplies.packComplete': 'Complete Pack',
    'supplies.items': 'items included',
    'supplies.viewPack': 'View Complete Pack',
    'supplies.buyPack': 'Buy the Complete Pack',
    'supplies.saveTime': 'All necessary supplies for {grade} in one pack. Save time and money!',
    'supplies.addPack': 'Add Pack',
    'supplies.content': 'Pack contents by category:',
    'supplies.allPack': 'Complete pack',
    'supplies.included': 'Items included in the pack:',
    'supplies.total': 'Pack total:',
    'supplies.quantity': 'Quantity included:',
    'supplies.brand': 'Recommended brand:',
    'supplies.subtotal': 'Pack subtotal',
    'supplies.download': 'Download',
    'supplies.print': 'Print',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDesc': 'Add some school supply packs to get started.',
    'cart.continueShopping': 'Continue Shopping',
    'cart.quantity': 'Quantity',
    'cart.price': 'Price',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping Information',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.state': 'State',
    'checkout.zipCode': 'ZIP Code',
    'checkout.summary': 'Order Summary',
    'checkout.placeOrder': 'Place Order',
    'checkout.cancel': 'Cancel',

    // Auth
    'auth.login': 'Login',
    'auth.loginDesc': 'Sign in to your Plan Ahead Solutions account',
    'auth.register': 'Register',
    'auth.registerDesc': 'Create your Plan Ahead Solutions account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.loginHere': 'Sign in here',
    'auth.registerHere': 'Register here',

    // Dashboard
    'dashboard.welcome': 'Welcome, {name}!',
    'dashboard.title': 'Dashboard',
    'dashboard.purchaseHistory': 'Purchase History',
    'dashboard.noPurchases': 'No purchases recorded',
    'dashboard.noPurchasesDesc': 'When you make your first purchase, it will appear here.',
    'dashboard.orderDate': 'Order Date',
    'dashboard.items': 'Items',

    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.account': 'My Account',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',

    // How it works
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Get your child\'s school supplies in just 3 simple steps',
    'howItWorks.step1.title': 'Find Your School',
    'howItWorks.step1.desc': 'Search and select your child\'s school from our directory.',
    'howItWorks.step2.title': 'Select Grade',
    'howItWorks.step2.desc': 'Choose your child\'s grade to see the official supply list.',
    'howItWorks.step3.title': 'Buy the Pack',
    'howItWorks.step3.desc': 'Add the complete pack to cart and complete your purchase.',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We\'re here to help with any questions about our services',
    'contact.name': 'Name',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send Message',

    // Messages
    'messages.packAdded': 'Pack added to cart',
    'messages.packAddedDesc': 'Complete {grade} pack added to your cart with {count} items.',
    'messages.downloading': 'Downloading list',
    'messages.downloadingDesc': 'The supply list will be downloaded in PDF format.',
    'messages.printing': 'Printing list',
    'messages.printingDesc': 'Print dialog will open.',
    'messages.welcome': 'Welcome!',
    'messages.welcomeDesc': 'You have successfully logged in.',
    'messages.loginError': 'Login error',
    'messages.loginErrorDesc': 'Check your email and password.',
    'messages.error': 'Error',
    'messages.errorDesc': 'An error occurred. Please try again.',

    // Common
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    
    admin: {
      login: 'Admin Access',
      loginDesc: 'Enter your administrator credentials',
      username: 'Username',
      welcome: 'Welcome Administrator',
      loginSuccess: 'Successfully logged into admin panel',
      invalidCredentials: 'Invalid credentials',
      logout: 'Logout',
      dashboard: 'Admin Dashboard',
      analytics: 'Analytics',
      schools: 'Schools',
      packs: 'Packs',
      users: 'Users',
      settings: 'Settings',
      
      // Analytics
      totalSales: 'Total Sales',
      totalOrders: 'Total Orders',
      avgOrderValue: 'Average Order Value',
      totalUsers: 'Total Users',
      fromLastMonth: 'from last month',
      newThisMonth: 'new this month',
      salesTrend: 'Sales Trend',
      salesTrendDesc: 'Sales from the last 6 months',
      topPacks: 'Top Selling Packs',
      topPacksDesc: 'Distribution by popularity',
      monthlyOrders: 'Monthly Orders',
      monthlyOrdersDesc: 'Number of orders per month',
      sales: 'Sales',
      orders: 'Orders',
      
      // School Management
      schoolManagement: 'School Management',
      schoolManagementDesc: 'Manage schools registered on the platform',
      addSchool: 'Add School',
      editSchool: 'Edit School',
      addSchoolDesc: 'Complete the new school information',
      editSchoolDesc: 'Modify the school information',
      schoolName: 'School Name',
      location: 'Location',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
      schoolAdded: 'School Added',
      schoolAddedDesc: 'The school has been added successfully',
      schoolUpdated: 'School Updated',
      schoolUpdatedDesc: 'The school information has been updated',
      schoolDeleted: 'School Deleted',
      schoolDeletedDesc: 'The school has been removed from the system',
      
      // Pack Management
      packManagement: 'Pack Management',
      packManagementDesc: 'Manage school supply packs',
      addPack: 'Add Pack',
      editPack: 'Edit Pack',
      addPackDesc: 'Create a new school supply pack',
      editPackDesc: 'Modify the pack information',
      packName: 'Pack Name',
      price: 'Price',
      school: 'School',
      grade: 'Grade',
      description: 'Description',
      items: 'Items',
      onePerLine: 'one per line',
      selectSchool: 'Select School',
      selectGrade: 'Select Grade',
      packAdded: 'Pack Added',
      packAddedDesc: 'The pack has been added successfully',
      packUpdated: 'Pack Updated',
      packUpdatedDesc: 'The pack information has been updated',
      packDeleted: 'Pack Deleted',
      packDeletedDesc: 'The pack has been removed from the system',
      
      // User Management
      userManagement: 'User Management',
      userManagementDesc: 'Manage users registered on the platform',
      registrationDate: 'Registration Date',
      totalPurchases: 'Total Purchases',
      totalSpent: 'Total Spent',
      lastLogin: 'Last Login',
      userDetails: 'User Details',
      userDetailsDesc: 'Detailed user information',
      userDeleted: 'User Deleted',
      userDeletedDesc: 'The user has been removed from the system',
      
      // Admin Settings
      adminCredentials: 'Admin Credentials',
      adminCredentialsDesc: 'Update panel access credentials',
      currentPassword: 'Current Password',
      newUsername: 'New Username',
      newPassword: 'New Password',
      updateCredentials: 'Update Credentials',
      credentialsUpdated: 'Credentials Updated',
      credentialsUpdatedDesc: 'Credentials have been updated successfully',
      systemInfo: 'System Information',
      systemInfoDesc: 'General platform information',
      version: 'Version',
      lastUpdate: 'Last Update',
      totalSchools: 'Total Schools',
      totalPacks: 'Total Packs',
    }
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const getNestedValue = (obj: any, path: string): string => {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : path;
      }, obj);
    };

    let translation = getNestedValue(translations[language], key);
    
    // Ensure we always return a string
    if (typeof translation !== 'string') {
      translation = key;
    }
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
