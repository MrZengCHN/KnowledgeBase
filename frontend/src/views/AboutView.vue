<script setup>
import avatarImg from '@/assets/avatar.jpg'

const skills = {
  frontend: [
    { name: 'Vue.js', level: 90 },
    { name: 'TailwindCSS', level: 95 },
    { name: 'JavaScript', level: 85 },
    { name: 'HTML5/CSS3', level: 90 }
  ],
  backend: [
    { name: 'Java', level: 90 },
    { name: 'Spring Boot', level: 85 },
    { name: 'Spring Cloud', level: 80 },
    { name: 'MySQL', level: 85 },
    { name: 'Redis', level: 80 }
  ],
  devops: [
    { name: 'Linux', level: 85 },
    { name: 'Docker', level: 80 },
    { name: 'Git', level: 90 },
    { name: 'Nginx', level: 75 }
  ]
}
</script>

<template>
  <div class="min-h-[calc(100vh-68px)] p-4 md:p-8 max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
      
      <!-- Left Column: Profile Card (Sticky) -->
      <div class="md:col-span-6 lg:col-span-4 relative">
        <div class="sticky top-24 space-y-6">
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
            <figure class="px-10 pt-10">
              <div class="avatar my-1">
                <div class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img :src="avatarImg" class="object-cover w-full h-full block" />
                </div>
              </div>
            </figure>
            <div class="card-body items-center text-center">
              <h2 class="card-title text-2xl font-bold">Mr. Zeng</h2>
              <div class="badge badge-primary badge-outline mt-1">全栈开发工程师</div>
              
              <p class="text-sm text-gray-500 mt-4 text-left w-full">
                热爱技术，专注于构建高质量的 Web 应用。善于解决复杂问题，追求代码的优雅与性能。
              </p>
              
              <div class="divider my-2"></div>

              <div class="w-full text-left text-sm space-y-2">
                <div class="flex justify-between items-center">
                  <span class="font-bold opacity-70 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                    教育背景
                  </span>
                  <span>本科 / 网络工程</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-bold opacity-70 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    坐标
                  </span>
                  <span>中国</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-bold opacity-70 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    Github
                  </span>
                  <a href="https://github.com/MrZengCHN" target="_blank" class="link link-primary hover:text-primary-focus">@MrZengCHN</a>
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-bold opacity-70 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Email
                  </span>
                  <a href="mailto:1164334031@qq.com" class="link link-primary hover:text-primary-focus">1164334031@qq.com</a>
                </div>
              </div>

              <div class="card-actions justify-center mt-6 gap-2">
                <div class="badge badge-ghost">自由</div> 
                <div class="badge badge-ghost">民主</div> 
                <div class="badge badge-ghost">科学</div>
                <div class="badge badge-ghost">和平</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Skills & Details (Scrollable) -->
      <div class="md:col-span-6 lg:col-span-8 space-y-6">
        
        <!-- Frontend Card -->
        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style="animation-delay: 0.1s;">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-3 text-primary mb-4">
              <div class="p-2 bg-primary/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              前端开发
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="skill in skills.frontend" :key="skill.name">
                <div class="flex justify-between text-sm mb-2 font-medium">
                  <span>{{ skill.name }}</span>
                  <span class="text-primary">{{ skill.level }}%</span>
                </div>
                <progress class="progress progress-primary w-full h-2" :value="skill.level" max="100"></progress>
              </div>
            </div>
          </div>
        </div>

        <!-- Backend Card -->
        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style="animation-delay: 0.2s;">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-3 text-secondary mb-4">
              <div class="p-2 bg-secondary/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
              </div>
              后端开发
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="skill in skills.backend" :key="skill.name">
                <div class="flex justify-between text-sm mb-2 font-medium">
                  <span>{{ skill.name }}</span>
                  <span class="text-secondary">{{ skill.level }}%</span>
                </div>
                <progress class="progress progress-secondary w-full h-2" :value="skill.level" max="100"></progress>
              </div>
            </div>
          </div>
        </div>

        <!-- DevOps Card -->
        <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style="animation-delay: 0.3s;">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-3 text-accent mb-4">
              <div class="p-2 bg-accent/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              运维 & 工具
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="skill in skills.devops" :key="skill.name">
                <div class="flex justify-between text-sm mb-2 font-medium">
                  <span>{{ skill.name }}</span>
                  <span class="text-accent">{{ skill.level }}%</span>
                </div>
                <progress class="progress progress-accent w-full h-2" :value="skill.level" max="100"></progress>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
