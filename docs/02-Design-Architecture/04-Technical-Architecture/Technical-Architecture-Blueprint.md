# SDLC 4.7 - Technical Architecture Blueprint
## Project: HR Profiling Platform - Infrastructure and Deployment Architecture
### Document ID: TECH-ARCH-001
### Version: 1.0.0
### Date: October 12, 2025
### Status: ACTIVE

---

## 1. Technical Architecture Overview

### 1.1 Architecture Philosophy
The HR Profiling Platform employs a cloud-native, microservices-based architecture designed for Vietnamese market requirements, emphasizing cultural intelligence, scalability, and enterprise-grade security. The system integrates psychological profiling with Vietnamese cultural analytics.

### 1.2 Architecture Principles
- **Cloud-Native Design**: Container-first approach with Kubernetes orchestration
- **Microservices Pattern**: Loosely coupled, independently deployable services
- **API-First Strategy**: RESTful APIs with OpenAPI specifications
- **Event-Driven Architecture**: Asynchronous communication for scalability
- **Cultural Intelligence**: Vietnamese cultural context throughout the stack
- **Security by Design**: Zero-trust security model with defense in depth

## 2. High-Level Architecture Diagram

### 2.1 System Architecture Overview
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HR PROFILING PLATFORM                              │
│                        TECHNICAL ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────┐ │
│  │   PRESENTATION      │    │     API GATEWAY     │    │   EXTERNAL      │ │
│  │     LAYER           │    │      LAYER          │    │  INTEGRATIONS   │ │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────┘ │
│           │                           │                           │         │
│           ▼                           ▼                           ▼         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    MICROSERVICES LAYER                                 │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │ │ USER        │ │ ASSESSMENT  │ │ CULTURAL    │ │ REPORTING &         │ │ │
│  │ │ MANAGEMENT  │ │ SERVICES    │ │ INTELLIGENCE│ │ ANALYTICS           │ │ │
│  │ │ SERVICE     │ │             │ │ SERVICE     │ │ SERVICE             │ │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│           │                           │                           │         │
│           ▼                           ▼                           ▼         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       DATA LAYER                                       │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │ │ PostgreSQL  │ │ Redis       │ │ Elasticsearch│ │ File Storage       │ │ │
│  │ │ Database    │ │ Cache       │ │ Search       │ │ (AWS S3)           │ │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Infrastructure Architecture

### 3.1 Cloud Infrastructure Design
```yaml
# Infrastructure as Code - Terraform Configuration
# AWS Multi-Region Deployment for Vietnamese Market

resource "aws_vpc" "hr_profiling_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "hr-profiling-vpc"
    Environment = var.environment
    Project     = "hr-profiling-platform"
    Region      = "ap-southeast-1" # Singapore for Vietnamese market
  }
}

# Multi-AZ Deployment for High Availability
resource "aws_subnet" "private_subnets" {
  count             = 3
  vpc_id            = aws_vpc.hr_profiling_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "hr-profiling-private-subnet-${count.index + 1}"
    Type = "Private"
  }
}

resource "aws_subnet" "public_subnets" {
  count                   = 3
  vpc_id                  = aws_vpc.hr_profiling_vpc.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "hr-profiling-public-subnet-${count.index + 1}"
    Type = "Public"
  }
}

# EKS Cluster for Container Orchestration
resource "aws_eks_cluster" "hr_profiling_cluster" {
  name     = "hr-profiling-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = concat(aws_subnet.private_subnets[*].id, aws_subnet.public_subnets[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks_encryption.arn
    }
    resources = ["secrets"]
  }

  tags = {
    Name        = "hr-profiling-eks-cluster"
    Environment = var.environment
  }
}
```

### 3.2 Container Architecture
```yaml
# Kubernetes Deployment Configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hr-profiling-api
  namespace: hr-profiling
  labels:
    app: hr-profiling-api
    version: v1
    cultural-context: vietnamese
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hr-profiling-api
  template:
    metadata:
      labels:
        app: hr-profiling-api
        version: v1
    spec:
      containers:
      - name: api-server
        image: hr-profiling/api:1.0.0
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: CULTURAL_CONTEXT
          value: "vietnamese"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 4. Microservices Architecture

### 4.1 Service Decomposition
```
HR Profiling Platform Microservices:

┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE CATALOG                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. USER MANAGEMENT SERVICE                                      │
│    ├── Authentication & Authorization                          │
│    ├── User Profile Management                                 │
│    ├── Vietnamese Cultural Preferences                         │
│    └── Role-Based Access Control                               │
│                                                                 │
│ 2. ASSESSMENT ORCHESTRATION SERVICE                             │
│    ├── Assessment Lifecycle Management                         │
│    ├── Multi-type Assessment Coordination                      │
│    ├── Cultural Adaptation Engine                              │
│    └── Progress Tracking                                       │
│                                                                 │
│ 3. DISC ASSESSMENT SERVICE                                      │
│    ├── Question Management (Vietnamese/English)                │
│    ├── Response Collection & Validation                        │
│    ├── Scoring Algorithm with Cultural Weights                 │
│    └── Results Interpretation                                  │
│                                                                 │
│ 4. MBTI ASSESSMENT SERVICE                                      │
│    ├── Type Determination Logic                                │
│    ├── Vietnamese Cultural Adaptation                          │
│    ├── Career Matching Algorithm                               │
│    └── Team Compatibility Analysis                             │
│                                                                 │
│ 5. NUMEROLOGY SERVICE                                           │
│    ├── Vietnamese Numerology Calculations                      │
│    ├── Cultural Significance Interpretation                    │
│    ├── Career Guidance Generation                              │
│    └── Lucky Elements Analysis                                 │
│                                                                 │
│ 6. CV ANALYSIS SERVICE                                          │
│    ├── AI-Powered CV Parsing                                   │
│    ├── Skill Extraction & Categorization                       │
│    ├── Vietnamese Market Relevance Scoring                     │
│    └── Personality-CV Correlation Analysis                     │
│                                                                 │
│ 7. CULTURAL INTELLIGENCE SERVICE                                │
│    ├── Vietnamese Cultural Dimension Analysis                  │
│    ├── Cultural Fit Assessment                                 │
│    ├── Team Cultural Dynamics                                  │
│    └── Cross-Cultural Communication Guidance                   │
│                                                                 │
│ 8. REPORTING & ANALYTICS SERVICE                                │
│    ├── Comprehensive Report Generation                         │
│    ├── Vietnamese-specific Templates                           │
│    ├── Data Visualization & Insights                           │
│    └── Export & Sharing Capabilities                           │
│                                                                 │
│ 9. NOTIFICATION SERVICE                                         │
│    ├── Multi-channel Notifications                             │
│    ├── Vietnamese Language Support                             │
│    ├── Cultural Event Scheduling                               │
│    └── Assessment Reminders                                    │
│                                                                 │
│ 10. FILE MANAGEMENT SERVICE                                     │
│     ├── Secure File Upload/Download                            │
│     ├── Document Processing Pipeline                           │
│     ├── Virus Scanning & Validation                            │
│     └── Metadata Management                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Service Communication Patterns
```yaml
# Service Mesh Configuration with Istio
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: hr-profiling-services
  namespace: hr-profiling
spec:
  hosts:
  - user-management.hr-profiling.svc.cluster.local
  - assessment-orchestration.hr-profiling.svc.cluster.local
  - disc-assessment.hr-profiling.svc.cluster.local
  - mbti-assessment.hr-profiling.svc.cluster.local
  - numerology.hr-profiling.svc.cluster.local
  - cv-analysis.hr-profiling.svc.cluster.local
  - cultural-intelligence.hr-profiling.svc.cluster.local
  - reporting-analytics.hr-profiling.svc.cluster.local
  ports:
  - number: 80
    name: http
    protocol: HTTP
  - number: 443
    name: https
    protocol: HTTPS
  resolution: DNS

---
# Traffic Management for Vietnamese Cultural Context
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: cultural-routing
  namespace: hr-profiling
spec:
  hosts:
  - hr-profiling-api
  http:
  - match:
    - headers:
        cultural-context:
          exact: vietnamese
    route:
    - destination:
        host: cultural-intelligence
        subset: vietnamese-optimized
      weight: 100
  - match:
    - headers:
        cultural-context:
          exact: international
    route:
    - destination:
        host: cultural-intelligence
        subset: international
      weight: 100
```

## 5. Security Architecture

### 5.1 Zero-Trust Security Model
```yaml
# Security Policy Configuration
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: hr-profiling-security
  namespace: hr-profiling
spec:
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/hr-profiling/sa/api-gateway"]
    to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
    when:
    - key: request.headers[authorization]
      values: ["Bearer *"]
  - from:
    - source:
        principals: ["cluster.local/ns/hr-profiling/sa/assessment-service"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/api/v1/users/*", "/api/v1/cultural/*"]
    when:
    - key: custom.cultural_context
      values: ["vietnamese", "international"]

---
# Network Security Policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: hr-profiling-network-policy
  namespace: hr-profiling
spec:
  podSelector:
    matchLabels:
      app: hr-profiling-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: istio-system
    - podSelector:
        matchLabels:
          app: hr-profiling-frontend
    ports:
    - protocol: TCP
      port: 5000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector:
        matchLabels:
          name: redis
    ports:
    - protocol: TCP
      port: 6379
```

### 5.2 Data Encryption Strategy
```yaml
# Encryption Configuration
apiVersion: v1
kind: Secret
metadata:
  name: encryption-keys
  namespace: hr-profiling
type: Opaque
data:
  database-encryption-key: <base64-encoded-key>
  file-encryption-key: <base64-encoded-key>
  vietnamese-cultural-data-key: <base64-encoded-key>
  jwt-signing-key: <base64-encoded-key>

---
# SSL/TLS Configuration
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: hr-profiling-gateway
  namespace: hr-profiling
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: hr-profiling-tls-cert
    hosts:
    - api.hrprofiling.vn
    - app.hrprofiling.vn
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - api.hrprofiling.vn
    - app.hrprofiling.vn
    # Redirect HTTP to HTTPS
    tls:
      httpsRedirect: true
```

## 6. Data Architecture

### 6.1 Database Deployment Architecture
```yaml
# PostgreSQL High Availability Setup
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: hr-profiling-postgres
  namespace: hr-profiling
spec:
  instances: 3
  primaryUpdateStrategy: unsupervised
  
  postgresql:
    parameters:
      max_connections: "200"
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
      work_mem: "4MB"
      maintenance_work_mem: "64MB"
      # Vietnamese collation support
      lc_collate: "vi_VN.UTF-8"
      lc_ctype: "vi_VN.UTF-8"
      
  bootstrap:
    initdb:
      database: hr_profiling
      owner: hr_user
      secret:
        name: postgres-credentials
      dataChecksums: true
      encoding: "UTF8"
      localeCType: "vi_VN.UTF-8"
      localeCollate: "vi_VN.UTF-8"

  storage:
    size: 100Gi
    storageClass: gp3-encrypted

  monitoring:
    enabled: true

  backup:
    retentionPolicy: "30d"
    barmanObjectStore:
      destinationPath: "s3://hr-profiling-backups/postgres"
      s3Credentials:
        accessKeyId:
          name: backup-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: backup-credentials
          key: SECRET_ACCESS_KEY
      wal:
        retention: "7d"
      data:
        retention: "30d"

---
# Redis Cluster for Caching
apiVersion: redis.redis.opstreelabs.in/v1beta1
kind: RedisCluster
metadata:
  name: hr-profiling-redis
  namespace: hr-profiling
spec:
  clusterSize: 6
  kubernetesConfig:
    image: redis:7-alpine
    imagePullPolicy: IfNotPresent
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi
  redisExporter:
    enabled: true
    image: oliver006/redis_exporter:latest
  storage:
    volumeClaimTemplate:
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
        storageClassName: gp3-encrypted
```

### 6.2 Elasticsearch Configuration
```yaml
# Elasticsearch for Search and Analytics
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: hr-profiling-es
  namespace: hr-profiling
spec:
  version: 8.10.0
  nodeSets:
  - name: master
    count: 3
    config:
      node.roles: ["master"]
      # Vietnamese text analysis
      analysis:
        analyzer:
          vietnamese_analyzer:
            tokenizer: icu_tokenizer
            filter:
              - lowercase
              - icu_folding
              - vietnamese_stop
              - vietnamese_stemmer
        filter:
          vietnamese_stop:
            type: stop
            stopwords: ["và", "của", "trong", "với", "để", "từ", "tại", "theo"]
          vietnamese_stemmer:
            type: stemmer
            language: light_vietnamese
    podTemplate:
      spec:
        containers:
        - name: elasticsearch
          resources:
            requests:
              memory: 2Gi
              cpu: 1
            limits:
              memory: 4Gi
              cpu: 2
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 50Gi
        storageClassName: gp3-encrypted
  - name: data
    count: 3
    config:
      node.roles: ["data", "ingest"]
    podTemplate:
      spec:
        containers:
        - name: elasticsearch
          resources:
            requests:
              memory: 4Gi
              cpu: 2
            limits:
              memory: 8Gi
              cpu: 4
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 100Gi
        storageClassName: gp3-encrypted
```

## 7. Monitoring and Observability

### 7.1 Monitoring Stack Configuration
```yaml
# Prometheus Configuration for Vietnamese Cultural Metrics
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "hr-profiling-rules.yml"
    
    scrape_configs:
    - job_name: 'hr-profiling-api'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - hr-profiling
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: hr-profiling-.*
      - source_labels: [__meta_kubernetes_pod_annotation_cultural_context]
        target_label: cultural_context
    
    - job_name: 'vietnamese-cultural-metrics'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - hr-profiling
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_component]
        action: keep
        regex: cultural-intelligence
      - source_labels: [__meta_kubernetes_pod_annotation_cultural_region]
        target_label: vietnamese_region

---
# Custom Metrics for Vietnamese Cultural Context
apiVersion: v1
kind: ConfigMap
metadata:
  name: hr-profiling-rules
  namespace: monitoring
data:
  hr-profiling-rules.yml: |
    groups:
    - name: hr-profiling-cultural-metrics
      rules:
      - alert: VietnameseCulturalAdaptationLow
        expr: cultural_adaptation_score < 0.7
        for: 5m
        labels:
          severity: warning
          cultural_context: vietnamese
        annotations:
          summary: "Low cultural adaptation score detected"
          description: "Cultural adaptation score {{ $value }} is below threshold for Vietnamese users"
      
      - alert: NumerologyCalculationFailure
        expr: increase(numerology_calculation_errors_total[5m]) > 5
        for: 2m
        labels:
          severity: critical
          service: numerology
        annotations:
          summary: "High numerology calculation failure rate"
          description: "{{ $value }} numerology calculation failures in the last 5 minutes"
      
      - record: vietnamese_user_engagement_rate
        expr: sum(rate(assessment_completions_total{cultural_context="vietnamese"}[5m])) / sum(rate(assessment_starts_total{cultural_context="vietnamese"}[5m]))
      
      - record: cultural_preference_distribution
        expr: count by (cultural_depth) (user_cultural_preferences{cultural_context="vietnamese"})
```

### 7.2 Logging Architecture
```yaml
# Fluentd Configuration for Vietnamese Content
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: logging
data:
  fluent.conf: |
    <source>
      @type kubernetes_metadata
      @id kubernetes_metadata
      kubernetes_url "#{ENV['KUBERNETES_SERVICE_HOST']}:#{ENV['KUBERNETES_SERVICE_PORT_HTTPS']}"
      verify_ssl true
      ca_file /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file /var/run/secrets/kubernetes.io/serviceaccount/token
    </source>
    
    # Parse Vietnamese cultural logs
    <filter kubernetes.**>
      @type parser
      key_name log
      reserve_data true
      <parse>
        @type json
        json_parser_error_class JSONParseError
        keep_time_key false
      </parse>
    </filter>
    
    # Enrich logs with cultural context
    <filter kubernetes.var.log.containers.hr-profiling-**>
      @type record_transformer
      <record>
        cultural_context ${record.dig("kubernetes", "labels", "cultural-context") || "unknown"}
        vietnamese_region ${record.dig("kubernetes", "annotations", "vietnamese-region") || "unknown"}
        assessment_type ${record.dig("kubernetes", "labels", "assessment-type") || "unknown"}
      </record>
    </filter>
    
    # Route Vietnamese cultural logs to separate index
    <match kubernetes.var.log.containers.cultural-intelligence-**>
      @type elasticsearch
      host elasticsearch-master.elasticsearch.svc.cluster.local
      port 9200
      index_name vietnamese-cultural-logs
      type_name _doc
      <buffer>
        @type file
        path /var/log/fluentd-buffers/vietnamese-cultural.buffer
        flush_mode interval
        retry_type exponential_backoff
        flush_thread_count 2
        flush_interval 5s
        retry_forever
        retry_max_interval 30
        chunk_limit_size 2M
        queue_limit_length 8
        overflow_action block
      </buffer>
    </match>
    
    # General application logs
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch-master.elasticsearch.svc.cluster.local
      port 9200
      index_name hr-profiling-logs
      type_name _doc
      <buffer>
        @type file
        path /var/log/fluentd-buffers/hr-profiling.buffer
        flush_mode interval
        retry_type exponential_backoff
        flush_thread_count 2
        flush_interval 5s
        retry_forever
        retry_max_interval 30
        chunk_limit_size 2M
        queue_limit_length 8
        overflow_action block
      </buffer>
    </match>
```

## 8. Performance and Scalability

### 8.1 Auto-scaling Configuration
```yaml
# Horizontal Pod Autoscaler for Cultural Intelligence Service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cultural-intelligence-hpa
  namespace: hr-profiling
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cultural-intelligence
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: vietnamese_assessment_requests_per_second
      target:
        type: AverageValue
        averageValue: "10"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max

---
# Cluster Autoscaler Configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  template:
    spec:
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.0
        name: cluster-autoscaler
        resources:
          limits:
            cpu: 100m
            memory: 300Mi
          requests:
            cpu: 100m
            memory: 300Mi
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/hr-profiling-cluster
        - --balance-similar-node-groups
        - --skip-nodes-with-system-pods=false
        - --scale-down-enabled=true
        - --scale-down-delay-after-add=10m
        - --scale-down-unneeded-time=10m
        - --scale-down-utilization-threshold=0.5
        env:
        - name: AWS_REGION
          value: ap-southeast-1
```

## 9. Disaster Recovery and Business Continuity

### 9.1 Multi-Region Deployment Strategy
```yaml
# Disaster Recovery Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: disaster-recovery-config
  namespace: hr-profiling
data:
  recovery-plan.yaml: |
    primary_region: ap-southeast-1  # Singapore
    disaster_recovery_region: ap-southeast-2  # Sydney
    
    backup_strategy:
      database:
        frequency: "every 6 hours"
        retention: "30 days"
        cross_region_replication: true
        encryption: true
      
      file_storage:
        frequency: "every 12 hours"
        retention: "90 days"
        cross_region_replication: true
        encryption: true
      
      vietnamese_cultural_data:
        frequency: "daily"
        retention: "1 year"
        expert_validation_required: true
        cross_region_replication: true
    
    failover_criteria:
      rto: "4 hours"  # Recovery Time Objective
      rpo: "1 hour"   # Recovery Point Objective
      automated_failover: false  # Manual approval required
      
    vietnamese_market_considerations:
      business_hours: "08:00-18:00 ICT"
      peak_assessment_periods:
        - "09:00-11:00 ICT"
        - "14:00-16:00 ICT"
      cultural_data_criticality: "high"
      numerology_service_priority: "medium"

---
# Cross-Region Database Replication
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: hr-profiling-postgres-dr
  namespace: hr-profiling
spec:
  instances: 1
  
  replica:
    enabled: true
    source: hr-profiling-postgres
    
  externalClusters:
  - name: hr-profiling-postgres
    connectionParameters:
      host: postgres-primary.ap-southeast-1.amazonaws.com
      user: postgres
      dbname: hr_profiling
    password:
      name: postgres-dr-credentials
      key: password
```

## 10. DevOps and CI/CD Pipeline

### 10.1 GitOps Deployment Pipeline
```yaml
# ArgoCD Application for HR Profiling Platform
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hr-profiling-platform
  namespace: argocd
spec:
  project: default
  
  source:
    repoURL: https://github.com/hr-profiling/platform-configs
    targetRevision: main
    path: k8s
    
  destination:
    server: https://kubernetes.default.svc
    namespace: hr-profiling
    
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PruneLast=true
    
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  
  # Health checks for Vietnamese cultural services
  ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
    - /spec/replicas
  
  # Custom health checks
  health:
    - group: argoproj.io
      kind: Rollout
      check: |
        health_status = {}
        if obj.status ~= nil then
          if obj.status.replicas ~= nil and obj.status.replicas > 0 then
            health_status.status = "Healthy"
            health_status.message = "All replicas are running"
          else
            health_status.status = "Progressing"
            health_status.message = "Waiting for replicas"
          end
        end
        return health_status

---
# GitHub Actions Workflow for Vietnamese Cultural Validation
name: Cultural Content Validation
on:
  pull_request:
    paths:
    - 'src/cultural/**'
    - 'src/numerology/**'
    - 'config/vietnamese/**'

jobs:
  validate-vietnamese-content:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Validate Vietnamese Text
      run: |
        # Check for proper Vietnamese diacritics
        python scripts/validate-vietnamese-text.py
        
        # Validate cultural context accuracy
        python scripts/validate-cultural-context.py
        
        # Check numerology calculations
        python scripts/validate-numerology.py
    
    - name: Cultural Expert Review Required
      if: contains(github.event.pull_request.changed_files, 'cultural/')
      run: |
        echo "Cultural content changes detected"
        echo "Expert review required before merge"
        gh pr review --request-changes \
          --body "Cultural expert review required for Vietnamese content changes"
```

---

**Document Control:**
- Author: Cloud Architect, DevOps Engineer
- Reviewer: Infrastructure Lead, Security Architect, Vietnamese Cultural Consultant
- Approved By: CTO, Technical Director
- Next Review: January 12, 2026
- Classification: INTERNAL USE