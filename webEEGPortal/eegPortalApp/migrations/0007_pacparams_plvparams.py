# Generated by Django 2.2 on 2020-08-05 22:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('eegPortalApp', '0006_auto_20200729_2347'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlvParams',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lcut', models.FloatField()),
                ('hcut', models.FloatField()),
                ('rippleDB', models.FloatField()),
                ('bandWidth', models.FloatField()),
                ('attenHz', models.FloatField()),
                ('analysisDetail', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='eegPortalApp.AnalysisDetail')),
            ],
        ),
        migrations.CreateModel(
            name='PacParams',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lcut', models.FloatField()),
                ('hcut', models.FloatField()),
                ('rippleDB', models.FloatField()),
                ('bandWidth', models.FloatField()),
                ('attenHz', models.FloatField()),
                ('analysisDetail', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='eegPortalApp.AnalysisDetail')),
            ],
        ),
    ]
