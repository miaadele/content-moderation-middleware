#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/evp.h>
#include <openssl/err.h>

// defining hash size for portability
// sha-256 produces 64-byte hash
#define HASH_SIZE 64

// sigh errors
void handle_errors()
{
    ERR_print_errors_fp(stderr);
    exit(EXIT_FAILURE);
}

// it's time for hashbrowns
void compute_sha256(const char *message, unsigned char *hash)
{
    EVP_MD_CTX *mdctx = EVP_MD_CTX_new(); // new message digest
    // initialize hashing
    if (!mdctx || EVP_DigestInit_ex(mdctx, EVP_sha256(), NULL) <= 0 ||
        EVP_DigestUpdate(mdctx, message, strlen(message)) <= 0 ||
        EVP_DigestFinal_ex(mdctx, hash, NULL) <= 0)
    {
        handle_errors();
    }
    EVP_MD_CTX_free(mdctx);
}
