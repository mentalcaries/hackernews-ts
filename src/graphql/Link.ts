import { arg, extendType, intArg, nonNull, objectType, stringArg } from 'nexus';
import { context } from '../context';

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('description');
    t.nonNull.string('url');
    t.nonNull.dateTime("createdAt")
    t.field('postedBy', {
      type: 'User',
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field('voter', {
      type: 'User',
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('feed', {
      type: 'Link',
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg()
      },
      resolve(parent, args, context) {
        const where = args.filter ? {
          OR: [
            {description: { contains: args.filter } },
            { url: { contains: args.filter } }
          ]
        }
        : {};
        return context.prisma.link.findMany({
          where,
        });
      },
    });
  },
});

export const LinkMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('post', {
      type: 'Link',
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args;
        const { userId } = context;
        if (!userId) {
          throw new Error('Cannot post without logging in.');
        }
        const newLink = context.prisma.link.create({
          data: {
            description: args.description,
            url: args.url,
            postedBy: { connect: { id: userId } },
          },
        });
        return newLink;
      },
    });
  },
});
