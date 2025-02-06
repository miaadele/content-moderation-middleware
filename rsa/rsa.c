#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/evp.h>
#include <openssl/pem.h>
#include <openssl/err.h>

#define KEY_SIZE 1024
#define PUBLIC_EXPONENT 65537
#define PLAIN_TEXT "Hi Friend. How are you?"

// alas don't error out but ik you will
void handle_errors()
{
    ERR_print_errors_fp(stderr);
    exit(EXIT_FAILURE);
}

// generate a new rsa key pair
EVP_PKEY *generate()
{
    EVP_PKEY *pkey = NULL;
    // initialize a new context for key generation
    EVP_PKEY_CTX *ctx = EVP_PKEY_CTX_new_id(EVP_PKEY_RSA, NULL);

    // parameters for key generation
    if (!ctx || EVP_PKEY_keygen_init(ctx) <= 0 ||
        EVP_PKEY_CTX_set_rsa_keygen_bits(ctx, KEY_SIZE) <= 0 ||
        EVP_PKEY_keygen(ctx, &pkey) <= 0)
    {
        handle_errors();
    }

    EVP_PKEY_CTX_free(ctx); // clean up the memory
    return pkey;
}

// save the private and public key to separate files
void save_keys(EVP_PKEY *pkey)
{
    // open files in binary write
    FILE *priv_file = fopen("private.pem", "wb");
    FILE *pub_file = fopen("public.pem", "wb");

    // write the keys to files
    if (!priv_file || !pub_file ||
        !PEM_write_PrivateKey(priv_file, pkey, NULL, NULL, 0, NULL, NULL) ||
        !PEM_write_PUBKEY(pub_file, pkey))
    {
        handle_errors();
    }

    // close the files bc good programming
    fclose(priv_file);
    fclose(pub_file);
}

// encrypt the message using public key
int rsa_encrypt(EVP_PKEY *pkey, unsigned char *plaintext, size_t plaintext_len, unsigned char **encrypted)
{
    EVP_PKEY_CTX *ctx = EVP_PKEY_CTX_new(pkey, NULL); // create encryption stuff
    if (!ctx || EVP_PKEY_encrypt_init(ctx) <= 0)      // initialize encryption
        handle_errors();

    // we need to know the buffer size aka the output length
    size_t encrypted_len;
    if (EVP_PKEY_encrypt(ctx, NULL, &encrypted_len, plaintext, plaintext_len) <= 0)
        handle_errors();

    // memory yay!
    *encrypted = malloc(encrypted_len);
    if (EVP_PKEY_encrypt(ctx, *encrypted, &encrypted_len, plaintext, plaintext_len) <= 0) // encrypt here
        handle_errors();

    // free and return
    EVP_PKEY_CTX_free(ctx);
    return encrypted_len;
}

// now, using the private key, decrypt
int rsa_decrypt(EVP_PKEY *pkey, unsigned char *encrypted, size_t encrypted_len, unsigned char **decrypted)
{
    EVP_PKEY_CTX *ctx = EVP_PKEY_CTX_new(pkey, NULL); // decryption context
    if (!ctx || EVP_PKEY_decrypt_init(ctx) <= 0)      // initalize
        handle_errors();

    // we care about the buffer size
    size_t decrypted_len;
    if (EVP_PKEY_decrypt(ctx, NULL, &decrypted_len, encrypted, encrypted_len) <= 0)
        handle_errors();

    // memory
    *decrypted = malloc(decrypted_len);
    if (EVP_PKEY_decrypt(ctx, *decrypted, &decrypted_len, encrypted, encrypted_len) <= 0) // decrypt!
        handle_errors();

    // free and return
    EVP_PKEY_CTX_free(ctx);
    return decrypted_len;
}

// driver function to do rsa
int main()
{
    EVP_PKEY *pkey = generate(); // call function
    save_keys(pkey);             // put in files

    unsigned char *encrypted = NULL, *decrypted = NULL;
    int encrypted_len = rsa_encrypt(pkey, (unsigned char *)PLAIN_TEXT, strlen(PLAIN_TEXT) + 1, &encrypted); // encrypt

    FILE *enc_file = fopen("enmsg.enc", "wb");
    fwrite(encrypted, 1, encrypted_len, enc_file);
    fclose(enc_file);

    int decrypted_len = rsa_decrypt(pkey, encrypted, encrypted_len, &decrypted); // decrypt
    printf("Decrypted message (%d bytes): %s\n", decrypted_len, decrypted);

    // memory leak prevention
    free(encrypted);
    free(decrypted);
    EVP_PKEY_free(pkey);
    return 0;
}
