<script setup>
onMounted(() => {
  // FUNCS
  /**
   * Scroll down the page on hashtag to display text under header block.
   */
  function scrollToChapter() {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 50,
          // behavior: 'smooth' // Для плавной прокрутки
        });
      }
    }
  }

  // MAIN
  window.addEventListener('hashchange', scrollToChapter);
  scrollToChapter();
});
</script>

<template>
  <div class="app-frame">
    <AppHeader/>
    <div class="app-main">
      <div class="app-left"></div>
      <main class="app-center">
        <slot/>
      </main>
      <div class="app-right"></div>
    </div>
    <AppFooter/>
  </div>
</template>

<style>
.app-frame {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  display: flex;
}

.app-left, .app-center, .app-right {
  flex: 1;
}

.app-center {
  margin: 0;
  max-width: 800px;
}
</style>