#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char** argv) {
    if (argc < 2) {
        fprintf(stderr, "Uso: %s <chave>\n", argv[0]);
        return 1;
    }

    const char* key = argv[1];
    const size_t keylen = strlen(key);
    if (keylen == 0) {
        fprintf(stderr, "Chave não pode ser vazia\n");
        return 1;
    }

    unsigned char buf[4096];
    size_t i = 0;

    while (!feof(stdin)) {
        size_t n = fread(buf, 1, sizeof(buf), stdin);
        if (ferror(stdin)) {
            perror("fread");
            return 1;
        }
        for (size_t j = 0; j < n; ++j) {
            buf[j] ^= (unsigned char)key[i % keylen];
            i++;
        }
        if (n > 0) {
            size_t w = fwrite(buf, 1, n, stdout);
            if (w != n) {
                perror("fwrite");
                return 1;
            }
        }
    }

    return 0;
}
