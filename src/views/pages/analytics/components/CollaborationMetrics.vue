<template>
  <v-card class="collaboration-metrics" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Collaboration Metrics</h3>
        <v-btn 
          size="small" 
          variant="text" 
          color="primary"
          @click="$emit('refresh')"
        >
          Refresh
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div v-if="data" class="collaboration-content">
          <!-- Filter Summary -->
          <div class="filter-summary">
            <v-chip 
              v-if="data.teamId"
              color="primary"
              variant="tonal"
              size="small"
              class="me-2"
            >
              Team: {{ data.teamId }}
            </v-chip>
            <v-chip 
              color="info"
              variant="tonal"
              size="small"
            >
              {{ data.dateRange }}
            </v-chip>
          </div>

          <!-- Communication Channels -->
          <div v-if="data.communication?.length" class="communication-section">
            <h4 class="section-title">Communication Channels</h4>
            <div class="communication-grid">
              <div 
                v-for="channel in data.communication" 
                :key="channel.channel"
                class="communication-card"
              >
                <div class="channel-icon">
                  <v-icon :color="getChannelColor(channel.channel)" size="24">
                    {{ getChannelIcon(channel.channel) }}
                  </v-icon>
                </div>
                <div class="channel-content">
                  <div class="channel-name">{{ formatChannelName(channel.channel) }}</div>
                  <div class="channel-count">{{ channel.count }} interactions</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cross-Team Collaboration -->
          <div v-if="data.crossTeam?.length" class="cross-team-section">
            <h4 class="section-title">Cross-Team Collaboration</h4>
            <div class="cross-team-list">
              <div 
                v-for="collab in data.crossTeam" 
                :key="`${collab.sourceDepartmentId}-${collab.targetDepartmentId}`"
                class="cross-team-item"
              >
                <div class="collab-icon">
                  <v-icon color="primary" size="20" icon="mdi-account-group" />
                </div>
                <div class="collab-content">
                  <div class="collab-teams">
                    <span class="source-team">{{ collab.sourceDepartmentId }}</span>
                    <v-icon color="grey" size="16" icon="mdi-arrow-right" />
                    <span class="target-team">{{ collab.targetDepartmentId }}</span>
                  </div>
                  <div class="collab-interactions">
                    {{ collab.interactions }} interactions
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Knowledge Sharing -->
          <div v-if="data.knowledgeSharing?.length" class="knowledge-section">
            <h4 class="section-title">Knowledge Sharing</h4>
            <div class="knowledge-list">
              <div 
                v-for="knowledge in data.knowledgeSharing.slice(0, 5)" 
                :key="knowledge.topic"
                class="knowledge-item"
              >
                <div class="knowledge-icon">
                  <v-icon color="success" size="20" icon="mdi-book-open-variant" />
                </div>
                <div class="knowledge-content">
                  <div class="knowledge-topic">{{ knowledge.topic }}</div>
                  <div class="knowledge-contributions">
                    {{ knowledge.contributions }} contributions
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Meetings -->
          <div v-if="data.meetings?.length" class="meetings-section">
            <h4 class="section-title">Meetings</h4>
            <div class="meetings-list">
              <div 
                v-for="meeting in data.meetings.slice(0, 5)" 
                :key="meeting.title"
                class="meeting-item"
              >
                <div class="meeting-icon">
                  <v-icon color="warning" size="20" icon="mdi-video" />
                </div>
                <div class="meeting-content">
                  <div class="meeting-header">
                    <span class="meeting-title">{{ meeting.title }}</span>
                    <v-chip 
                      color="primary"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ meeting.count }} meetings
                    </v-chip>
                  </div>
                  <div v-if="meeting.avgDurationMin" class="meeting-duration">
                    Avg duration: {{ formatDuration(meeting.avgDurationMin) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Collaboration Patterns -->
          <div v-if="data.patterns?.length" class="patterns-section">
            <h4 class="section-title">Collaboration Patterns</h4>
            <div class="patterns-grid">
              <div 
                v-for="pattern in data.patterns" 
                :key="pattern.pattern"
                class="pattern-card"
              >
                <div class="pattern-header">
                  <span class="pattern-name">{{ formatPatternName(pattern.pattern) }}</span>
                  <v-chip 
                    :color="getPatternColor(pattern.score)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ pattern.score.toFixed(1) }}
                  </v-chip>
                </div>
                <div class="pattern-score">
                  <v-progress-linear 
                    :model-value="pattern.score * 10"
                    :color="getPatternColor(pattern.score)"
                    height="6"
                    rounded
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.communication?.length && !data.crossTeam?.length && !data.knowledgeSharing?.length && !data.meetings?.length && !data.patterns?.length" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-account-group" />
            <p class="text-body-2 text-medium-emphasis">No collaboration data available</p>
            <p class="text-caption text-medium-emphasis">Collaboration metrics will appear here once available</p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  data: any;
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const getChannelColor = (channel: string) => {
  const colors: Record<string, string> = {
    'comments': 'primary',
    'mentions': 'info',
    'files': 'success'
  };
  return colors[channel] || 'grey';
};

const getChannelIcon = (channel: string) => {
  const icons: Record<string, string> = {
    'comments': 'mdi-comment-multiple',
    'mentions': 'mdi-at',
    'files': 'mdi-file-document'
  };
  return icons[channel] || 'mdi-circle';
};

const getPatternColor = (score: number) => {
  if (score >= 8) return 'success';
  if (score >= 6) return 'primary';
  if (score >= 4) return 'warning';
  return 'error';
};

const formatChannelName = (channel: string) => {
  return channel.charAt(0).toUpperCase() + channel.slice(1);
};

const formatPatternName = (pattern: string) => {
  return pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};
</script>

<style scoped>
.collaboration-metrics {
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

.collaboration-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.communication-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.communication-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.communication-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.channel-icon {
  flex-shrink: 0;
}

.channel-content {
  flex: 1;
  min-width: 0;
}

.channel-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.channel-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.cross-team-list,
.knowledge-list,
.meetings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cross-team-item,
.knowledge-item,
.meeting-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.collab-icon,
.knowledge-icon,
.meeting-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.collab-content,
.knowledge-content,
.meeting-content {
  flex: 1;
  min-width: 0;
}

.collab-teams {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.source-team,
.target-team {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.collab-interactions,
.knowledge-contributions,
.meeting-duration {
  font-size: 0.75rem;
  color: #6b7280;
}

.meeting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.meeting-title,
.knowledge-topic {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.pattern-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.pattern-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.pattern-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.pattern-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.pattern-score {
  margin-top: 0.5rem;
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
