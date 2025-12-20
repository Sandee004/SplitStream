from fastapi import FastAPI, Depends, HTTPException, status, Security, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from passlib.context import CryptContext
import os
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi.middleware.cors import CORSMiddleware
import uuid
import random
from sqlalchemy.orm import joinedload
from typing import List
import secrets
import string
from web3 import Web3
from dotenv import load_dotenv