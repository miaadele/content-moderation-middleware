# script to create a self-signed root CA
# serves to emulate a CA
# creates ca privae key, ca certificate, private key, and leaf certificate

# looked at DigiCert CS RSA4096 Root G5 from Microsoft

# pip install cryptography *** must do this

import os
import datetime
from cryptography import x509
from cryptography.x509.oid import NameOID, ExtendedKeyUsageOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta, timezone

# directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
CERT_DIR = os.path.join(BASE_DIR, "certs")
KEY_DIR = os.path.join(BASE_DIR, "keys")
for d in (CERT_DIR, KEY_DIR):
    os.makedirs(d, exist_ok=True)

# generate root ca key and self-signed ceritificate
root_key = rsa.generate_private_key(
    public_exponent=65537, key_size=4096
)  # public exponent is standard
root_name = x509.Name(
    [
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "CA"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "SantaClara"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Ascertion"),
        x509.NameAttribute(NameOID.COMMON_NAME, "MiaVani Root CA"),
    ]
)
root_cert = (
    x509.CertificateBuilder()
    .subject_name(root_name)
    .issuer_name(root_name)
    .public_key(root_key.public_key())
    .serial_number(x509.random_serial_number())
    .not_valid_before(datetime.now(timezone.utc))
    .not_valid_after(datetime.now(timezone.utc) + timedelta(days=3650))
    .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
    .sign(root_key, hashes.SHA256())
)

# generate leaf key & CSR
leaf_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
leaf_name = x509.Name(
    [
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "CA"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "Santa Clara"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Ascertion"),
        x509.NameAttribute(NameOID.COMMON_NAME, "Code-Signer"),
    ]
)

csr = (
    x509.CertificateSigningRequestBuilder()
    .subject_name(leaf_name)
    .sign(leaf_key, hashes.SHA256())
)

# issue leaf cert from ROOT CA with Code Signing EKU
leaf_cert = (
    x509.CertificateBuilder()
    .subject_name(csr.subject)
    .issuer_name(root_cert.subject)
    .public_key(csr.public_key())
    .serial_number(x509.random_serial_number())
    .not_valid_before(datetime.now(timezone.utc))
    .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365))
    .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
    .add_extension(
        x509.ExtendedKeyUsage([ExtendedKeyUsageOID.CODE_SIGNING]), critical=False
    )
    .sign(root_key, hashes.SHA256())
)


# write PEM files
def write_pem(obj, path, is_private=False):
    if is_private:
        data = obj.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        )
    else:
        data = obj.public_bytes(encoding=serialization.Encoding.PEM)
    with open(path, "wb") as f:
        f.write(data)


# call write_pem
write_pem(root_key, os.path.join(CERT_DIR, "rootCA.key"), is_private=True)
write_pem(root_cert, os.path.join(CERT_DIR, "rootCA.pem"))
write_pem(leaf_key, os.path.join(KEY_DIR, "mycodesign.key"), is_private=True)
write_pem(leaf_cert, os.path.join(CERT_DIR, "mycodesign.crt"))

# please work
print("\u2714 Root CA and code-signing leaf certificate generated succesfully!")
