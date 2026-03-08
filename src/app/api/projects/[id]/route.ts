import { NextRequest } from 'next/server';
import {
  GET as getProjectRoute,
  PUT as putProjectRoute,
  DELETE as deleteProjectRoute,
} from '@/app/api/projects/route';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  return getProjectRoute(request, context);
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  return putProjectRoute(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  return deleteProjectRoute(request, context);
}
