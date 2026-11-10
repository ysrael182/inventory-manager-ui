<template>
  <v-container>
    <v-card class="pa-6" elevation="8">
      <v-card-title class="text-h5">📊 Generar Reporte</v-card-title>
      <v-card-text>
        <!-- Report Type -->
        <v-select
          v-model="reportType"
          :items="['Día', 'Mes', 'Año', 'Rango']"
          label="Tipo de reporte"
          outlined
          dense
        />

        <!-- Date Range (always available if Rango selected) -->
        <v-row v-if="reportType === 'Rango'" class="mt-4">
          <v-col cols="6">
            <v-date-picker v-model="startDate" title="Fecha inicio" />
          </v-col>
          <v-col cols="6">
            <v-date-picker v-model="endDate" title="Fecha fin" />
          </v-col>
        </v-row>

        <!-- Fields to Export -->
        <v-row class="mt-4">
          <v-col cols="12">
            <div class="text-subtitle-1 mb-2">Campos a exportar:</div>
            <v-checkbox v-for="field in fields" :key="field"
              v-model="selectedFields"
              :label="field"
              :value="field"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- Generate Button -->
        <v-btn
          prepend-icon="mdi-file-chart"
          color="primary"
          class="mt-4"
          @click="generateReport"
        >
          Generar Reporte
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Report Table -->
    <v-card v-if="reportData.length" class="mt-6 pa-4">
      <v-card-title class="text-h6">📑 Resultados</v-card-title>
      <v-data-table
        :headers="headers"
        :items="reportData"
        class="mt-4"
      />

      <!-- Download CSV -->
      <v-btn
        prepend-icon="mdi-download"
        color="success"
        class="mt-4"
        @click="downloadCSV"
      >
        Descargar CSV
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
//import { exportToCSV } from "@/utils/csvExport";

const reportType = ref("Día");
const startDate = ref(null);
const endDate = ref(null);

const fields = ["Nombre", "Cantidad", "Unidad", "Descripción", "Imagen", "Nota"];
const selectedFields = ref<string[]>(["Nombre", "Cantidad", "Unidad"]);

const reportData = ref<any[]>([]);
const headers = ref<any[]>([]);

function generateReport() {
  // Example: fetch from backend depending on reportType
  // If reportType === 'Rango', use startDate & endDate
  // Otherwise group by day/month/year

  const data = [
    { Nombre: "Producto A", Cantidad: 10, Unidad: "kg", Descripción: "Harina", Imagen: "img.png", Nota: "Compra local" },
    { Nombre: "Producto B", Cantidad: 5, Unidad: "litro", Descripción: "Aceite", Imagen: "img2.png", Nota: "Mayorista" }
  ];

  // Filter fields
  reportData.value = data.map(item => {
    const filtered: any = {};
    selectedFields.value.forEach(f => filtered[f] = item[f]);
    return filtered;
  });

  headers.value = selectedFields.value.map(f => ({ text: f, value: f }));
}

function downloadCSV() {
  //exportToCSV(reportData.value, "reporte");
}
</script>
