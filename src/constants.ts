import type { Technology } from './types';

export const technologies: Technology[] = [
  // Frontend Frameworks & Libraries
  { id: 'react', name: 'React', icon: '⚛', iconType: 'svg', iconUrl: 'https://static.cdnlogo.com/logos/r/63/react.svg', color: '#1E3A8A', category: 'Frontend' },
  { id: 'vue', name: 'Vue.js', icon: 'V', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', color: '#1F2937', category: 'Frontend' },
  { id: 'angular', name: 'Angular', icon: 'Δ', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg', color: '#DD0031', category: 'Frontend' },
  { id: 'svelte', name: 'Svelte', icon: 'S', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg', color: '#FF3E00', category: 'Frontend' },
  { id: 'nextjs', name: 'Next.js', icon: '▲', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', color: '#F3F4F6', category: 'Frontend' },
  { id: 'nuxt', name: 'Nuxt.js', icon: '△', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg', color: '#1F2937', category: 'Frontend' },
  { id: 'gatsby', name: 'Gatsby', icon: 'G', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gatsby/gatsby-original.svg', color: '#F3F4F6', category: 'Frontend' },
  { id: 'remix', name: 'Remix', icon: '🎵', iconType: 'text', color: '#F3F4F6', category: 'Frontend' },

  // Backend Frameworks
  { id: 'spring', name: 'Spring', icon: '❀', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg', color: '#F3F4F6', category: 'Backend' },
  { id: 'express', name: 'Express.js', icon: 'E', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', color: '#F3F4F6', category: 'Backend' },
  { id: 'fastapi', name: 'FastAPI', icon: '⚡', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg', color: '#F3F4F6', category: 'Backend' },
  { id: 'django', name: 'Django', icon: 'D', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg', color: '#F3F4F6', category: 'Backend' },
  { id: 'flask', name: 'Flask', icon: 'F', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg', color: '#F3F4F6', category: 'Backend' },
  { id: 'laravel', name: 'Laravel', icon: 'L', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg', color: '#FF2D20', category: 'Backend' },
  { id: 'rails', name: 'Ruby on Rails', icon: '♦', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-original-wordmark.svg', color: '#F3F4F6', category: 'Backend' },
  { id: 'aspnet', name: 'ASP.NET', icon: '.NET', iconType: 'text', color: '#512BD4', category: 'Backend' },
  { id: 'gin', name: 'Gin', icon: '🍸', iconType: 'text', color: '#00ADD8', category: 'Backend' },
  { id: 'fiber', name: 'Fiber', icon: '⚡', iconType: 'text', color: '#00ADD8', category: 'Backend' },

  // Programming Languages
  { id: 'javascript', name: 'JavaScript', icon: 'JS', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', color: '#1F2937', category: 'Languages' },
  { id: 'typescript', name: 'TypeScript', icon: 'TS', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', color: '#F3F4F6', category: 'Languages' },
  { id: 'python', name: 'Python', icon: '🐍', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#F3F4F6', category: 'Languages' },
  { id: 'java', name: 'Java', icon: '☕', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', color: '#1F2937', category: 'Languages' },
  { id: 'csharp', name: 'C#', icon: 'C♯', iconType: 'text', color: '#F3F4F6', category: 'Languages' },
  { id: 'go', name: 'Go', icon: '🐹', iconType: 'text', color: '#1F2937', category: 'Languages' },
  { id: 'rust', name: 'Rust', icon: '🦀', iconType: 'text', color: '#CE422B', category: 'Languages' },
  { id: 'php', name: 'PHP', icon: '🐘', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', color: '#1F2937', category: 'Languages' },
  { id: 'ruby', name: 'Ruby', icon: '♦', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg', color: '#CC342D', category: 'Languages' },
  { id: 'swift', name: 'Swift', icon: '🦉', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg', color: '#1F2937', category: 'Languages' },
  { id: 'kotlin', name: 'Kotlin', icon: '🅺', iconType: 'text', color: '#F3F4F6', category: 'Languages' },
  { id: 'dart', name: 'Dart', icon: '🎯', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg', color: '#1F2937', category: 'Languages' },
  { id: 'cpp', name: 'C++', icon: 'C⁺⁺', iconType: 'text', color: '#1F2937', category: 'Languages' },
  { id: 'c', name: 'C', icon: 'C', iconType: 'text', color: '#1F2937', category: 'Languages' },

  // Databases
  { id: 'mysql', name: 'MySQL', icon: '🐬', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', color: '#F3F4F6', category: 'Database' },
  { id: 'postgres', name: 'PostgreSQL', icon: '🐘', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', color: '#F3F4F6', category: 'Database' },
  { id: 'mongodb', name: 'MongoDB', icon: 'M', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', color: '#F3F4F6', category: 'Database' },
  { id: 'redis', name: 'Redis', icon: '◆', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg', color: '#F3F4F6', category: 'Database' },
  { id: 'sqlite', name: 'SQLite', icon: '□', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg', color: '#F3F4F6', category: 'Database' },
  { id: 'cassandra', name: 'Cassandra', icon: '💎', iconType: 'text', color: '#1287B1', category: 'Database' },
  { id: 'dynamodb', name: 'DynamoDB', icon: '⚡', iconType: 'text', color: '#331f00', category: 'Database' },
  { id: 'elasticsearch', name: 'Elasticsearch', icon: 'E', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elasticsearch/elasticsearch-original.svg', color: '#F3F4F6', category: 'Database' },
  { id: 'neo4j', name: 'Neo4j', icon: '●', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/neo4j/neo4j-original.svg', color: '#F3F4F6', category: 'Database' },
  { id: 'influxdb', name: 'InfluxDB', icon: '📈', iconType: 'text', color: '#22ADF6', category: 'Database' },

  // DevOps & Infrastructure
  { id: 'docker', name: 'Docker', icon: '🐳', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', color: '#F3F4F6', category: 'DevOps' },
  { id: 'kubernetes', name: 'Kubernetes', icon: '☸', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg', color: '#F3F4F6', category: 'DevOps' },
  { id: 'jenkins', name: 'Jenkins', icon: 'J', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg', color: '#F3F4F6', category: 'DevOps' },
  { id: 'gitlab', name: 'GitLab CI', icon: 'GL', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg', color: '#1F2937', category: 'DevOps' },
  { id: 'github', name: 'GitHub Actions', icon: 'GH', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', color: '#F3F4F6', category: 'DevOps' },
  { id: 'terraform', name: 'Terraform', icon: 'T', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg', color: '#F3F4F6', category: 'DevOps' },
  { id: 'ansible', name: 'Ansible', icon: 'A', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg', color: '#F3F4F6', category: 'DevOps' },
  { id: 'vagrant', name: 'Vagrant', icon: 'V', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vagrant/vagrant-original.svg', color: '#F3F4F6', category: 'DevOps' },
  { id: 'helm', name: 'Helm', icon: '⚓', iconType: 'text', color: '#0F1689', category: 'DevOps' },

  // Cloud Platforms
  { id: 'aws', name: 'AWS', icon: '☁️', iconType: 'text', color: '#FF9900', category: 'Cloud' },
  { id: 'azure', name: 'Azure', icon: '⧨', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg', color: '#F3F4F6', category: 'Cloud' },
  { id: 'gcp', name: 'Google Cloud', icon: '◉', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg', color: '#F3F4F6', category: 'Cloud' },
  { id: 'digitalocean', name: 'DigitalOcean', icon: '◊', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/digitalocean/digitalocean-original.svg', color: '#F3F4F6', category: 'Cloud' },
  { id: 'heroku', name: 'Heroku', icon: 'H', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/heroku/heroku-original.svg', color: '#F3F4F6', category: 'Cloud' },
  { id: 'vercel', name: 'Vercel', icon: '▲', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/vercel/vercel-icon.svg', color: '#9dafc8', category: 'Cloud' },
  { id: 'netlify', name: 'Netlify', icon: 'N', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/netlify/netlify-icon.svg', color: '#1F2937', category: 'Cloud' },

  // Message Queues & Streaming
  { id: 'kafka', name: 'Apache Kafka', icon: 'K', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg', color: '#F3F4F6', category: 'Messaging' },
  { id: 'rabbitmq', name: 'RabbitMQ', icon: 'R', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg', color: '#1F2937', category: 'Messaging' },
  { id: 'activemq', name: 'ActiveMQ', icon: '📨', iconType: 'text', color: '#FF6600', category: 'Messaging' },
  { id: 'pulsar', name: 'Apache Pulsar', icon: '💫', iconType: 'text', color: '#188FFF', category: 'Messaging' },
  { id: 'nats', name: 'NATS', icon: '⚡', iconType: 'text', color: '#375C93', category: 'Messaging' },
  { id: 'sqs', name: 'Amazon SQS', icon: '📬', iconType: 'text', color: '#FF9900', category: 'Messaging' },
  { id: 'servicebus', name: 'Azure Service Bus', icon: '🚌', iconType: 'text', color: '#0078D4', category: 'Messaging' },

  // Web Servers & Proxies
  { id: 'nginx', name: 'Nginx', icon: 'N', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg', color: '#1a651a', category: 'Infrastructure' },
  { id: 'apache', name: 'Apache', icon: 'A', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg', color: '#9a181c', category: 'Infrastructure' },
  { id: 'traefik', name: 'Traefik', icon: '🚦', iconType: 'text', color: '#24A1C1', category: 'Infrastructure' },
  { id: 'haproxy', name: 'HAProxy', icon: '⚖️', iconType: 'text', color: '#106DA9', category: 'Infrastructure' },
  { id: 'envoy', name: 'Envoy', icon: 'E', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/envoyproxyio/envoyproxyio-icon.svg', color: '#AC6199', category: 'Infrastructure' },

  // Runtime Environments
  { id: 'nodejs', name: 'Node.js', icon: 'N', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', color: '#F3F4F6', category: 'Runtime' },
  { id: 'deno', name: 'Deno', icon: 'D', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/denojs/denojs-original.svg', color: '#F3F4F6', category: 'Runtime' },
  { id: 'bun', name: 'Bun', icon: '🥖', iconType: 'text', color: '#1F2937', category: 'Runtime' },

  // Mobile Development
  { id: 'flutter', name: 'Flutter', icon: 'F', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg', color: '#02569B', category: 'Mobile' },
  { id: 'reactnative', name: 'React Native', icon: 'RN', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', color: '#034e63', category: 'Mobile' },
  { id: 'ionic', name: 'Ionic', icon: 'I', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ionic/ionic-original.svg', color: '#002f80', category: 'Mobile' },
  { id: 'xamarin', name: 'Xamarin', icon: 'X', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xamarin/xamarin-original.svg', color: '#175782', category: 'Mobile' },

  // Monitoring & Observability
  { id: 'prometheus', name: 'Prometheus', icon: '🔥', iconType: 'text', color: '#892810', category: 'Monitoring' },
  { id: 'grafana', name: 'Grafana', icon: '📊', iconType: 'text', color: '#F46800', category: 'Monitoring' },
  { id: 'jaeger', name: 'Jaeger', icon: '🔍', iconType: 'svg', iconUrl: 'https://github.com/jaegertracing/artwork/blob/master/SVG/Jaeger_Logo_Final_PANTONE.svg', color: '#60D0E4', category: 'Monitoring' },
  { id: 'zipkin', name: 'Zipkin', icon: '🔍', iconType: 'text', color: '#FF6B35', category: 'Monitoring' },
  { id: 'newrelic', name: 'New Relic', icon: 'NR', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/newrelic/newrelic-icon.svg', color: '#008C99', category: 'Monitoring' },
  { id: 'datadog', name: 'Datadog', icon: 'DD', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/datadoghq/datadoghq-icon.svg', color: '#c9aeea', category: 'Monitoring' },

  // Testing
  { id: 'jest', name: 'Jest', icon: '🃏', iconType: 'text', color: '#C21325', category: 'Testing' },
  { id: 'cypress', name: 'Cypress', icon: '🌲', iconType: 'text', color: '#17202C', category: 'Testing' },
  { id: 'selenium', name: 'Selenium', icon: 'S', iconType: 'url', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg', color: '#43B02A', category: 'Testing' },
  { id: 'playwright', name: 'Playwright', icon: '🎭', iconType: 'text', color: '#2EAD33', category: 'Testing' },

  // Security & Authentication
  { id: 'keycloak', name: 'Keycloak', icon: '🔐', iconType: 'text', color: '#4D4D4D', category: 'Security' },
  { id: 'auth0', name: 'Auth0', icon: '0', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/auth0/auth0-icon.svg', color: '#333333', category: 'Security' },
  { id: 'okta', name: 'Okta', icon: 'O', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/okta/okta-icon.svg', color: '#007DC1', category: 'Security' },
  { id: 'vault', name: 'HashiCorp Vault', icon: 'V', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/vaultproject/vaultproject-icon.svg', color: '#d9d9d9', category: 'Security' },
  { id: 'opa', name: 'Open Policy Agent', icon: 'OPA', iconType: 'url', iconUrl: 'https://www.vectorlogo.zone/logos/openpolicyagent/openpolicyagent-icon.svg', color: '#7B68EE', category: 'Security' },
  { id: 'falco', name: 'Falco', icon: '🦅', iconType: 'text', color: '#00B4C5', category: 'Security' },

  // API & Gateway
  { id: 'kong', name: 'Kong Gateway', icon: '🦍', iconType: 'text', color: '#99d5ff', category: 'API' },
  { id: 'ambassador', name: 'Ambassador', icon: '🤝', iconType: 'text', color: '#AF5CF8', category: 'API' },
  { id: 'istio', name: 'Istio', icon: '🕸️', iconType: 'text', color: '#466BB0', category: 'API' },
  { id: 'linkerd', name: 'Linkerd', icon: '🔗', iconType: 'text', color: '#2DCEAA', category: 'API' },
  { id: 'consul', name: 'Consul', icon: '🏛️', iconType: 'text', color: '#CA2171', category: 'API' },
  { id: 'apigee', name: 'Apigee', icon: '🌐', iconType: 'text', color: '#062860', category: 'API' },

  // Data Processing & Analytics
  { id: 'spark', name: 'Apache Spark', icon: '⚡', iconType: 'text', color: '#b74815', category: 'Analytics' },
  { id: 'airflow', name: 'Apache Airflow', icon: '🌊', iconType: 'text', color: '#017CEE', category: 'Analytics' },
  { id: 'flink', name: 'Apache Flink', icon: '🔄', iconType: 'text', color: '#E6526F', category: 'Analytics' },
  { id: 'storm', name: 'Apache Storm', icon: '⛈️', iconType: 'text', color: '#29ABE0', category: 'Analytics' },
  { id: 'beam', name: 'Apache Beam', icon: '📡', iconType: 'text', color: '#FF6D00', category: 'Analytics' },
  { id: 'dbt', name: 'dbt', icon: '🔧', iconType: 'text', color: '#FF694B', category: 'Analytics' },

  // Search & Indexing
  { id: 'solr', name: 'Apache Solr', icon: '🔍', iconType: 'text', color: '#D9411E', category: 'Search' },
  { id: 'opensearch', name: 'OpenSearch', icon: '🔎', iconType: 'text', color: '#005EB8', category: 'Search' },
  { id: 'algolia', name: 'Algolia', icon: '🔍', iconType: 'text', color: '#5468FF', category: 'Search' },

  // Service Mesh & Networking
  { id: 'cilium', name: 'Cilium', icon: '🐝', iconType: 'text', color: '#F8C517', category: 'Networking' },
  { id: 'calico', name: 'Calico', icon: '🐱', iconType: 'text', color: '#FF6D01', category: 'Networking' },
  { id: 'flannel', name: 'Flannel', icon: '🧥', iconType: 'text', color: '#326CE5', category: 'Networking' },

  // Storage & File Systems
  { id: 'minio', name: 'MinIO', icon: '🪣', iconType: 'text', color: '#C72E29', category: 'Storage' },
  { id: 'ceph', name: 'Ceph', icon: '🐙', iconType: 'text', color: '#EF5C55', category: 'Storage' },
  { id: 'glusterfs', name: 'GlusterFS', icon: '📁', iconType: 'text', color: '#784421', category: 'Storage' },

  // Service & Node Types
  { id: 'gateway', name: 'Gateway', icon: '◎', color: '#3B82F6', category: 'Service' },
  { id: 'proxy', name: 'Proxy', icon: '◐', color: '#6366F1', category: 'Service' },
  { id: 'loadbalancer', name: 'Load Balancer', icon: '⚖', color: '#8B5CF6', category: 'Service' },

  // Default/Generic
  { id: 'default', name: 'Service', icon: '●', color: '#6B7280', category: 'General' }
];

// Node Types (shapes)
export const nodeTypes = [
  { id: 'cube', name: 'Cube', icon: '/cube-icon.svg', description: 'Standard cube node' },
  { id: 'service', name: 'Service', icon: '/service.svg', description: 'Service node' },
  { id: 'database', name: 'Database', icon: '/database.svg', description: 'Database node' },
  { id: 'device', name: 'Device', icon: '/device.svg', description: 'Device/Hardware node' },
  { id: 'gate', name: 'Gate', icon: '/gate.svg', description: 'Gate node' },
  { id: 'node', name: 'Node-ori', icon: '/node-ori.svg', description: 'Ori node' },
  { id: 'node-sss', name: 'Nodes', icon: '/node-sss.svg', description: 'Nodes' },
  { id: 'shield', name: 'Shield', icon: '/shield.svg', description: 'Shield' }
];
