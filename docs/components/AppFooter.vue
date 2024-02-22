<script setup>

</script>

<template>
  <footer>
    <div>&copy; 2023 Wiredgeese</div>
    <div class="v-line">|</div>
    <div><a href="mailto:info@wiredgeese.com">info@wiredgeese.com</a></div>
    <div class="v-line">|</div>
    <div><a href="https://t.me/wiredgeese">@wiredgeese</a></div>
  </footer>
</template>

<style>
FOOTER {
  background-color: var(--color-set-black);
  color: var(--color-set-green);
  display: flex;
  justify-content: center; /* Distribute space between elements */
  align-items: center; /* Center items vertically */
  margin-top: 50px;
  padding: 5px;
  text-align: center;
  z-index: 1000;
}

FOOTER A {
  font-weight: normal;
  color: var(--color-set-green);
}

FOOTER .v-line {
  padding-left: 5px;
  padding-right: 5px;
}

@media only screen and (max-width: 800px) {
  FOOTER {
    flex-direction: column;
  }

  FOOTER .v-line {
    display: none;
  }
}
</style>
