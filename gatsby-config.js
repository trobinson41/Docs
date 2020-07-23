/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

const asciidoc = require('asciidoctor')();
const { resolvePathFromSlug } = require('./src/utils/resolvePathFromSlug');

class TemplateConverter {
  constructor() {
    // Use default html5 converter
    this.baseConverter = asciidoc.Html5Converter.$new();
  }

  convert(node, transform) {
    // Convert inline_anchors to support linking to slugs
    if (node.getNodeName() === 'inline_anchor') {
      const target = node.getTarget();

      if (!target.includes('/') && target.includes('.html')) {
        // Remove the automatically appended .html
        const newTarget = target.replace('.html', '');

        // If the slug has a hash, then it means we are deep linking and need
        // to split off the slug
        const slug = newTarget.includes('#') ? newTarget.split('#')[0] : newTarget;

        // Get the resolved path
        const resolvedPath = resolvePathFromSlug(slug);

        // Set our href
        const href = newTarget.includes('#') ? `${resolvedPath}#${newTarget.split('#')[1]}` : resolvedPath;

        // If there is provided text, we'll use that by default
        const text = node.getText();
        if (text) return `<a href="${href}">${text}</a>`;

        // If there is no default text, we'll return the target by default
        // and attach a data-attribute that we can target in the client
        //
        // We'll use getTitleFromSlug to replace the innerText of the a element
        return `<a data-slug="${slug}" href="${href}">${target}</a>`;
      }
    }

    return this.baseConverter.convert(node, transform);
  }
}

module.exports = {
  /* Your site config here */
  siteMetadata: {},
  plugins: [
    'gatsby-plugin-layout',
    {
      resolve: 'gatsby-plugin-material-ui',
      // If you want to use styled components you should change the injection order.
      options: {
        // stylesProvider: {
        //   injectFirst: true,
        // },
      },
    },
    {
      resolve: 'gatsby-transformer-asciidoc',
      options: {
        safe: 'unsafe',
        attributes: {
          showtitle: true,
          imagesdir: '/images',
        },
        converterFactory: TemplateConverter,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: `${__dirname}/src`,
      },
    },
    // Automatically catch links and make them work with SPA
    'gatsby-plugin-catch-links',
  ],
};
