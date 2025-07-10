import React from "react";
import { db } from "./services/firebase"; // Ajusta el path según tu proyecto
import { collection, addDoc, Timestamp } from "firebase/firestore";

async function testFirestore() {
  try {
    const docRef = await addDoc(collection(db, "evaluations"), {
      studentName: "test",
      scores: { indicador1: 3, indicador2: 2 },
      feedbackText: "prueba",
      totalScore: 5,
      percentage: 62,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      evaluatorName: "admin",
    });
    console.log("Doc creado con ID:", docRef.id);
    alert("¡Documento creado en Firestore! ID: " + docRef.id);
  } catch (error) {
    console.error("Error escribiendo en Firestore:", error);
    alert("Error al escribir en Firestore: " + error);
  }
}

export default function TestButton() {
  return (
    <button
      onClick={testFirestore}
      style={{ padding: 12, fontSize: 18, margin: 20 }}
    >
      Probar escritura en Firestore
    </button>
  );
}
