<template>
  <v-card class="custom-reports" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Custom Reports</h3>
        <div class="header-actions">
          <v-btn 
            size="small" 
            variant="outlined" 
            color="primary"
            @click="showExportDialog = true"
            :disabled="!data"
          >
            Export
          </v-btn>
          <v-btn 
            size="small" 
            variant="text" 
            color="primary"
            @click="$emit('refresh')"
          >
            Refresh
          </v-btn>
        </div>
      </div>
      
      <div class="widget-content">
        <div v-if="data" class="reports-content">
          <!-- Report Info -->
          <div class="report-info">
            <div class="report-meta">
              <v-chip 
                color="primary"
                variant="tonal"
                size="small"
                class="me-2"
              >
                {{ data.reportId }}
              </v-chip>
              <v-chip 
                color="info"
                variant="tonal"
                size="small"
              >
                {{ data.dateRange }}
              </v-chip>
            </div>
            
            <div v-if="data.meta" class="report-stats">
              <div class="stat-item">
              <v-icon color="primary" size="16" class="me-1" icon="mdi-database" />
                <span>{{ data.meta.rows || 'N/A' }} rows</span>
              </div>
              <div v-if="data.meta.generatedAt" class="stat-item">
              <v-icon color="success" size="16" class="me-1" icon="mdi-clock-check" />
                <span>{{ formatDate(data.meta.generatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Report Data Display -->
          <div v-if="data.data" class="report-data">
            <h4 class="section-title">Report Data</h4>
            
            <!-- If data is an array, display as table -->
            <div v-if="Array.isArray(data.data)" class="data-table">
              <v-table density="compact" class="report-table">
                <thead>
                  <tr>
                    <th 
                      v-for="(header, index) in getTableHeaders(data.data)" 
                      :key="index"
                      class="text-left"
                    >
                      {{ formatHeaderName(header) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(row, index) in data.data.slice(0, 10)" 
                    :key="index"
                    class="table-row"
                  >
                    <td 
                      v-for="(header, headerIndex) in getTableHeaders(data.data)" 
                      :key="headerIndex"
                    >
                      {{ formatCellValue(row[header]) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
              
              <div v-if="data.data.length > 10" class="table-footer">
                <v-chip size="small" variant="tonal" color="info">
                  Showing 10 of {{ data.data.length }} rows
                </v-chip>
              </div>
            </div>

            <!-- If data is an object, display as key-value pairs -->
            <div v-else class="data-object">
              <div 
                v-for="(value, key) in data.data" 
                :key="key"
                class="data-item"
              >
                <div class="data-key">{{ formatHeaderName(String(key)) }}</div>
                <div class="data-value">{{ formatCellValue(value) }}</div>
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div v-if="data.meta?.notes" class="notes-section">
            <h4 class="section-title">Notes</h4>
            <div class="notes-content">
            <v-icon color="info" size="16" class="me-2" icon="mdi-information" />
              <span>{{ data.meta.notes }}</span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.data && !data.meta?.notes" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-file-document-outline" />
            <p class="text-body-2 text-medium-emphasis">No report data available</p>
            <p class="text-caption text-medium-emphasis">Report data will appear here once generated</p>
          </div>
        </div>

        <!-- Export Dialog -->
        <v-dialog v-model="showExportDialog" max-width="500px">
          <v-card>
            <v-card-title>Export Report</v-card-title>
            <v-card-text>
              <v-form ref="exportForm" v-model="exportFormValid">
                <v-select
                  v-model="exportData.format"
                  :items="exportFormats"
                  label="Format"
                  required
                  :rules="[v => !!v || 'Format is required']"
                />
                
                <v-text-field
                  v-model="exportData.email"
                  label="Email (optional)"
                  type="email"
                  hint="Leave empty to download directly"
                />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="showExportDialog = false">Cancel</v-btn>
              <v-btn 
                color="primary" 
                @click="handleExport"
                :disabled="!exportFormValid"
                :loading="loading"
              >
                Export
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

interface Props {
  data: any;
  loading?: boolean;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'export', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showExportDialog = ref(false);
const exportFormValid = ref(false);
const loading = ref(false);

const exportData = reactive({
  format: 'PDF' as 'PDF' | 'Excel' | 'CSV',
  email: ''
});

const exportFormats = [
  { title: 'PDF', value: 'PDF' },
  { title: 'Excel', value: 'Excel' },
  { title: 'CSV', value: 'CSV' }
];

const getTableHeaders = (data: any[]) => {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]);
};

const formatHeaderName = (header: string) => {
  return header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatCellValue = (value: any) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    // Format numbers with appropriate precision
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2);
  }
  return value.toString();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const handleExport = async () => {
  loading.value = true;
  try {
    const exportPayload = {
      reportType: props.data?.reportId || 'custom',
      format: exportData.format,
      email: exportData.email || undefined
    };
    
    emit('export', exportPayload);
    showExportDialog.value = false;
    
    // Reset form
    exportData.email = '';
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.custom-reports {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reports-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-info {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.report-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.report-table {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  overflow: hidden;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(248, 250, 252, 0.8);
}

.table-footer {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.3);
  border-radius: 0 0 8px 8px;
}

.data-object {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.data-item {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.data-key {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.data-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.notes-section {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.notes-content {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state p {
  margin-top: 1rem;
}
</style>
