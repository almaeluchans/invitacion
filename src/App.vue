<script setup>
</script>

<template>
  <main>
    <router-view></router-view>
  </main>
</template>

<style>
:root {
  --font-title: 'Playfair Display', serif;
  --font-accent: 'Dancing Script', cursive;
  --font-body: 'Outfit', sans-serif;
  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  overflow-x: hidden;
  background: #000;
  color: #fff;
  transition: background 0.5s ease;
}

body.watercolor {
  background: #fdf6f0;
  color: #5a4b41;
}

body.glassmorphism {
  background: #0f172a;
}

.proposal-selector {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px;
  border-radius: 50px;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.proposal-selector button {
  background: transparent;
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: var(--transition);
  font-family: var(--font-body);
  font-weight: 500;
  white-space: nowrap;
}

.proposal-selector button.active {
  background: #fff;
  color: #000;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

body.watercolor .proposal-selector {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

body.watercolor .proposal-selector button {
  color: #5a4b41;
}

body.watercolor .proposal-selector button.active {
  background: #5a4b41;
  color: #fff;
}
</style>
