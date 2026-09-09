import { NextResponse } from 'next/server';

// Esta función recibe las peticiones POST enviadas desde el formulario
export async function POST(request: Request) {
  try {
    // 1. Leemos los datos enviados desde el formulario en formato JSON
    const body = await request.json();
    const { metros, habitaciones, banos, zona } = body;

    // 2. Definimos los precios base y multiplicadores (Regresión lineal)
    const basePrice = 20000;
    const precioMetro = 1200;
    const precioHabitacion = 8000;
    const precioBano = 5000;

    const zonasMultiplicador: Record<string, number> = {
      cercado: 1.0,
      residencial: 1.35,
      comercial: 1.2,
    };

    const factorZona = zonasMultiplicador[zona] || 1.0;

    // 3. Calculamos la predicción con los datos recibidos
    const estimacion = (basePrice + (Number(metros) * precioMetro) + (Number(habitaciones) * precioHabitacion) + (Number(banos) * precioBano)) * factorZona;

    // 4. Respondemos al formulario con el resultado en JSON
    return NextResponse.json({ 
      precioEstimado: Math.round(estimacion),
      rangoMinimo: Math.round(estimacion * 0.93),
      rangoMaximo: Math.round(estimacion * 1.07)
    });
  } catch {
  return NextResponse.json({ error: 'Error al procesar la predicción' }, { status: 400 });
}
}