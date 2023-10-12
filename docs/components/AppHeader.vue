<script setup>

</script>

<template>
  <header>
    <div class="h-left">
      <div class="img-container">
        <img src="/favicon.ico" alt="logo">
      </div>
      <h4>TeqFW</h4>
    </div>
    <div class="h-center">
      <h3>Dependency Injection</h3>
    </div>
    <div class="h-right">
      <div class="img-container">
        <a href="https://www.npmjs.com/package/@teqfw/di">
          <img src="/img/npm.png" alt="npm"/>
        </a>
      </div>
      <div class="img-container">
        <a href="https://github.com/teqfw/di">
          <img src="/img/github.svg" alt="GitHub"/>
        </a>
      </div>
    </div>
  </header>
</template>

<style>
HEADER {
  background-color: var(--color-set-black);
  color: var(--color-set-green);
  position: sticky;
  top: 0;
  z-index: 1000;;
}

HEADER, .h-left, .h-center, .h-right {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

HEADER H3, HEADER H4 {
  margin-block: 10px 10px;
}

.h-left {
  margin-left: 20px;
}

.h-right {
  margin-right: 20px;
}

.img-container {
  /* border: 2px solid var(--color-set-green); */
  margin: 5px;
  border-radius: 50%;
  height: 40px;
  overflow: hidden;
  width: 40px;
}

.img-container IMG {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>